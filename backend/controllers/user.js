import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;
         
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        const file = req.file;
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exist with this email.',
                success: false,
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile:{
                profilePhoto: cloudResponse.secure_url,
            }
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        };
        // check role is correct or not
        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false
            })
        };

        const tokenData = {
            userId: user._id
        }
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        // Set cookie with correct options: httpOnly (not httpsOnly), sameSite lax for dev, and secure only in production
        const cookieOptions = {
            maxAge: 1 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        };

        return res.status(200).cookie("token", token, cookieOptions).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const logout = async (req, res) => {
    try {
        // Clear the token cookie using same options as when it was set
        const cookieOptions = {
            maxAge: 0,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        };
        return res.status(200).cookie("token", "", cookieOptions).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}


export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const file = req.file;

        let cloudResponse = null;

        // Upload file only if provided
        if (file) {
            try {
                console.log('Starting file upload process...');
                
                // Basic file validation
                if (!file.buffer || !file.originalname) {
                    console.error('File validation failed:', { buffer: !!file.buffer, originalname: !!file.originalname });
                    throw new Error('Invalid file data');
                }

                // Log file details
                console.log('File details:', {
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    buffer: file.buffer.length
                });

                // Basic file validation
                if (!file.originalname.toLowerCase().endsWith('.pdf')) {
                    console.error('Invalid file type:', file.originalname);
                    throw new Error('Only PDF files are allowed');
                }

                // Generate a simple filename
                const timestamp = Date.now();
                const sanitizedName = file.originalname
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '_')
                    .replace(/\.pdf$/, '');
                const simpleName = `resume_${timestamp}_${sanitizedName}`;
                console.log('Generated filename:', simpleName);

                // Get data URI
                console.log('Converting file to Data URI...');
                const fileUri = getDataUri(file);
                if (!fileUri?.content) {
                    console.error('Data URI conversion failed');
                    throw new Error('Failed to process file');
                }
                console.log('Data URI conversion successful');

                // Upload to Cloudinary
                console.log('Starting Cloudinary upload...');
                cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                    resource_type: 'raw',
                    folder: 'resumes',
                    public_id: simpleName,
                    format: 'pdf',
                    type: 'upload',
                    use_filename: false,
                    unique_filename: true
                });

                // Log the full Cloudinary response for debugging
                console.log('Full Cloudinary response:', JSON.stringify(cloudResponse, null, 2));

                // Determine the best direct URL to the uploaded file
                const cloudUrl = cloudResponse?.secure_url || cloudResponse?.url || null;
                if (!cloudUrl && cloudResponse?.public_id) {
                    // Construct a direct URL as a fallback
                    const cName = process.env.CLOUD_NAME || '';
                    const resourceType = cloudResponse.resource_type || 'raw';
                    const format = cloudResponse.format || 'pdf';
                    if (cName) {
                        // e.g. https://res.cloudinary.com/<cloud_name>/raw/upload/<public_id>.<format>
                        const constructed = `https://res.cloudinary.com/${cName}/${resourceType}/upload/${cloudResponse.public_id}.${format}`;
                        console.log('Constructed Cloudinary URL fallback:', constructed);
                        cloudResponse._direct_url = constructed;
                    }
                } else if (cloudUrl) {
                    cloudResponse._direct_url = cloudUrl;
                }

            } catch (error) {
                console.error('Error in file upload:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                });

                // Check for specific error types
                if (error.http_code) {
                    console.error('Cloudinary error:', error);
                }

                return res.status(400).json({
                    message: "Error uploading file: " + error.message,
                    error: error.name,
                    success: false
                });
            }
        }

        let skillsArray = skills?.length > 0 ? skills.split(",") : [];

        const userId = req.id; // Middleware authentication should set this
        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        // Update user fields only if provided
        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio) user.profile.bio = bio;
        if (skillsArray.length > 0) user.profile.skills = skillsArray;

        // Upload resume only if cloudinary upload was successful
        if (cloudResponse) {
            // Prefer direct URL stored on cloudResponse._direct_url (we set this above), fall back to secure_url
            user.profile.resume = cloudResponse._direct_url || cloudResponse.secure_url || cloudResponse.url || null;
            user.profile.resumeOriginalName = file.originalname;
            console.log('Saving resume URL to user profile:', user.profile.resume);
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully.",
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                profile: user.profile
            },
            success: true
        });

    } catch (error) {
        console.error("Error in updateProfile:", error);
        return res.status(500).json({
            message: "Server Error",
            success: false,
            error: error.message
        });
    }
}

// AI-backed ATS scoring using Gemini
export const getAtsScoreAI = async (req, res) => {
    try {
        const userId = req.id;
        // Debug: entry log to help trace requests
        console.log(`getAtsScoreAI invoked; req.id=${userId}, timestamp=${new Date().toISOString()}`);
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const resumeUrl = user.profile?.resume;
        console.log('User resume URL:', resumeUrl);
        if (!resumeUrl) return res.status(400).json({ success: false, message: 'No resume uploaded' });

        // Download the resume PDF
        const fetchRes = await fetch(resumeUrl);
        if (!fetchRes.ok) {
            const txt = await fetchRes.text().catch(()=>null);
            console.error('Failed to fetch resume:', fetchRes.status, txt);
            return res.status(502).json({ success: false, message: 'Failed to download resume' });
        }
        const arrayBuffer = await fetchRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract text from PDF using pdf-parse (dynamic import to avoid module issues)
        let pdfParse;
        try {
            // Import the internal implementation directly to avoid pdf-parse's top-level test runner
            // which attempts to read './test/data/...' when the package root is executed as main under some importers.
            let mod;
            try {
                mod = await import('pdf-parse/lib/pdf-parse.js');
            } catch (e) {
                // Fallback to the package root import if the internal path isn't available
                mod = await import('pdf-parse');
            }
            console.log('pdf-parse import success; module keys:', Object.keys(mod || {}));
            const modKeys = Object.keys(mod || {});

            // helper to attempt calling a function or returning its promise result
            const attemptCall = async (fn, buf) => {
                const out = fn(buf);
                if (out && typeof out.then === 'function') return await out;
                return out;
            };

            // Common shapes:
            // 1) module is a callable function (v1 style)
            if (typeof mod === 'function') {
                pdfParse = mod;
            }
            // 2) default export is a function
            else if (mod && typeof mod.default === 'function') {
                pdfParse = mod.default;
            }
            // 3) module has a top-level parse function
            else if (mod && typeof mod.parse === 'function') {
                pdfParse = mod.parse;
            }
            // 4) module exposes a PDFParse class / constructor (v2-like) OR an object with helpers
            else if (mod && mod.PDFParse) {
                pdfParse = async (buf) => {
                    const P = mod.PDFParse;
                    try {
                        console.log('pdf-parse.PDFParse type:', typeof P, 'keys:', Object.keys(P || {}));
                    } catch (e) {
                        // ignore
                    }

                    // Try static parse method on P
                    try {
                        if (P && typeof P.parse === 'function') {
                            const out = await P.parse(buf);
                            return out;
                        }
                    } catch (e) { /* ignore */ }

                    // If P is a function (constructor or callable), try calling/constructing
                    if (typeof P === 'function') {
                        // Try calling as a function
                        try {
                            const maybe = P(buf);
                            if (maybe && typeof maybe.then === 'function') return await maybe;
                            if (maybe) return maybe;
                        } catch (e) { /* ignore */ }

                        // Try constructing instance
                        try {
                            let inst;
                            try { inst = new P(buf); } catch (e) { try { inst = new P({}); } catch (e2) { inst = null; } }
                            if (inst) {
                                if (typeof inst.parse === 'function') {
                                    const r = inst.parse(buf);
                                    if (r && typeof r.then === 'function') return await r;
                                    return r;
                                }
                                if (typeof inst.parseBuffer === 'function') {
                                    const r2 = inst.parseBuffer(buf);
                                    if (r2 && typeof r2.then === 'function') return await r2;
                                    return r2;
                                }
                            }
                        } catch (e) { /* ignore */ }
                    }

                    // If P is an object with nested constructors or functions, try common keys
                    try {
                        if (P && typeof P.PDFParse === 'function') {
                            const Fn = P.PDFParse;
                            try {
                                const maybe = Fn(buf);
                                if (maybe && typeof maybe.then === 'function') return await maybe;
                                if (maybe) return maybe;
                            } catch (e) { /* ignore */ }
                            try {
                                const inst = new Fn(buf);
                                if (inst) {
                                    if (typeof inst.parse === 'function') {
                                        const r = inst.parse(buf);
                                        if (r && typeof r.then === 'function') return await r;
                                        return r;
                                    }
                                }
                            } catch (e) { /* ignore */ }
                        }
                    } catch (e) { /* ignore */ }

                    // Try default.parse if present
                    if (mod.default && typeof mod.default.parse === 'function') {
                        return await mod.default.parse(buf);
                    }

                    console.error('Unexpected pdf-parse module shape (final):', modKeys, 'pdfParse keys:', Object.keys(P || {}));
                    throw new Error('pdf-parse module has unexpected shape on this server. Keys: ' + JSON.stringify(modKeys));
                };
            } else {
                console.error('Unexpected pdf-parse module shape:', Object.keys(mod || {}));
                throw new Error('pdf-parse module has unexpected shape on this server');
            }
        } catch (e) {
            console.error('pdf-parse import failed:', e);
            return res.status(500).json({ success: false, message: 'Server missing or incompatible pdf-parse' });
        }

                    let text;
                    try {
                        console.log('pdfParse resolver type:', typeof pdfParse);
                        console.log('Invoking pdfParse to extract text from buffer...');
                        const parsed = await pdfParse(buffer);
                        console.log('pdfParse invocation success; parsed keys:', Object.keys(parsed || {}));
                        text = parsed?.text || parsed?.content || '';
                        console.log('Extracted text length:', (text || '').length);
                    } catch (e) {
                        console.error('pdf-parse failed:', e);
                        // Fallback: if we cannot extract PDF text, build a profile-based prompt and let Gemini approximate an ATS score.
                        const fallbackPrompt = `Could you provide an ATS-style JSON evaluation (keys: score (0-100 integer), summary (2-3 sentences), recommendations (array of short tips)) based only on the following profile metadata?\n\nFullname: ${user.fullname}\nEmail: ${user.email}\nPhone: ${user.phoneNumber}\nSkills: ${Array.isArray(user.profile?.skills) ? user.profile.skills.join(', ') : user.profile?.skills || ''}\nBio: ${user.profile?.bio || ''}\nResume filename: ${user.profile?.resumeOriginalName || 'unknown'}`;
                        console.warn('Using profile-based fallback for ATS because PDF parsing failed.');
                        try {
                            const apiKey = process.env.GEMINI_API_KEY;
                            if (!apiKey) return res.status(500).json({ success: false, message: 'AI key not configured on server' });
                            const payloadFallback = {
                                contents: [{ parts: [{ text: fallbackPrompt }] }],
                                systemInstruction: { parts: [{ text: 'You are an expert ATS reviewer for aviation industry resumes. Return only valid JSON as specified.' }] },
                                generationConfig: { temperature: 0.0, maxOutputTokens: 300 }
                            };
                            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
                            const respFallback = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadFallback) });
                            if (!respFallback.ok) {
                                const tb = await respFallback.text().catch(()=>null);
                                console.error('Gemini fallback error', respFallback.status, tb);
                                return res.status(502).json({ success: false, message: 'AI service error' });
                            }
                            const dataFallback = await respFallback.json();
                            const replyFallback = dataFallback?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                            let parsedResultFallback = null;
                            try { parsedResultFallback = JSON.parse(replyFallback); } catch (e) {
                                const m = replyFallback.match(/\{[\s\S]*\}/);
                                if (m) {
                                    try { parsedResultFallback = JSON.parse(m[0]); } catch (e2) { parsedResultFallback = null; }
                                }
                            }
                            user.profile.atsAi = { computedAt: new Date(), raw: replyFallback, parsed: parsedResultFallback };
                            await user.save();
                            return res.status(200).json({ success: true, reply: replyFallback, parsed: parsedResultFallback });
                        } catch (errFallback) {
                            console.error('Fallback ATS via AI failed:', errFallback);
                            return res.status(500).json({ success: false, message: 'Failed to compute ATS' });
                        }
                    }

        // Prepare Gemini payload: ask for an ATS-style score and brief feedback in JSON
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, message: 'AI key not configured on server' });
        }

        const systemPrompt = `You are an expert ATS reviewer for aviation industry resumes. Given the resume text, provide a JSON object with keys: score (0-100 integer, higher is better for ATS), summary (2-3 sentence plain text explaining key issues or strengths), and recommendations (array of short actionable tips). Only return valid JSON.`;

        // Truncate resume text if too large for prompt; keep first ~40k chars
        const maxTextLen = 40000;
        const resumeTextForPrompt = text.length > maxTextLen ? text.slice(0, maxTextLen) + '\n\n[TRUNCATED]' : text;

        const payload = {
            contents: [
                { parts: [{ text: resumeTextForPrompt }] }
            ],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
                temperature: 0.0,
                maxOutputTokens: 400
            }
        };

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
        const resp = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            const errText = await resp.text().catch(()=>null);
            console.error('Gemini API error', resp.status, errText);
            return res.status(502).json({ success: false, message: 'AI service error' });
        }

        const data = await resp.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Try to parse JSON from reply; fallback to plain text
        let parsedResult = null;
        try {
            parsedResult = JSON.parse(reply);
        } catch (e) {
            // Attempt to extract JSON substring
            const m = reply.match(/\{[\s\S]*\}/);
            if (m) {
                try { parsedResult = JSON.parse(m[0]); } catch (e2) { parsedResult = null; }
            }
        }

        // Save to user profile for caching
        user.profile.atsAi = {
            computedAt: new Date(),
            raw: reply,
            parsed: parsedResult
        };
        await user.save();

        return res.status(200).json({ success: true, reply, parsed: parsedResult });
    } catch (error) {
        console.error('getAtsScoreAI error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}