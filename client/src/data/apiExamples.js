export const API_EXAMPLES = {
    textClip: {
        saveLocal: {
            title: "Save Text Clip (Local Mode)",
            method: "POST",
            endpoint: "/api/clip",
            description: "Save a text clip using the Local Mode endpoint.",
            curl: `curl -X POST http://localhost:5001/api/clip \
  -H "Content-Type: application/json" \
  -d '{
    "key": "local-test",
    "content": "Hello Local!",
    "expiry": "10m"
  }'`
        },
        saveGlobal: {
            title: "Save Text Clip (Global Mode)",
            method: "POST",
            endpoint: "/api/clip",
            description: "Save a text clip using the Global Mode endpoint with persistence.",
            curl: `curl -X POST https://api.cliphub.app/api/clip \
  -H "Content-Type: application/json" \
  -d '{
    "key": "global-test",
    "content": "Hello World!",
    "expiry": "24h"
  }'`
        },
        get: {
            title: "Get Text Clip",
            method: "GET/POST",
            endpoint: "/api/clip/:key",
            description: "Retrieve a text clip. Use POST if the clip is password-protected",
            requestBody: {
                password: "secret123"
            },
            response: {
                success: true,
                data: {
                    content: "Hello from ClipHub!",
                    createdAt: "2026-03-27T10:30:00Z",
                    viewCount: 1,
                    expiresIn: 3540,
                    oneTime: false,
                    type: "text",
                    viewLimit: 5,
                    viewsRemaining: 4
                }
            }
        }
    },

    fileUpload: {
        upload: {
            title: "Upload File",
            method: "POST",
            endpoint: "/api/file",
            description: "Upload a file (requires authentication)",
            headers: {
                "Authorization": "Bearer your-jwt-token"
            },
            formData: {
                file: "[Select your file]",
                key: "my-document",
                expiry: "1d"
            },
            response: {
                success: true,
                message: "File uploaded successfully",
                file: {
                    key: "my-document",
                    originalName: "document.pdf",
                    size: 1024000,
                    mimetype: "application/pdf",
                    uploadedBy: "John Doe",
                    url: "http://localhost:5000/api/file/my-document"
                }
            }
        },

        download: {
            title: "Download File",
            method: "GET",
            endpoint: "/api/file/:key",
            description: "Download a file by key",
            response: "Returns binary file data with proper Content-Type and Content-Disposition headers"
        }
    },

    auth: {
        signup: {
            title: "Create Account",
            method: "POST",
            endpoint: "/api/auth/signup",
            description: "Register a new user account",
            requestBody: {
                email: "user@example.com",
                password: "secure-password",
                name: "John Doe"
            },
            response: {
                success: true,
                message: "User created successfully",
                token: "jwt-token-here",
                user: {
                    id: "user-id",
                    email: "user@example.com",
                    name: "John Doe",
                    createdAt: "2026-03-27T10:30:00Z"
                }
            }
        },

        login: {
            title: "Sign In",
            method: "POST",
            endpoint: "/api/auth/login",
            description: "Authenticate with email and password",
            requestBody: {
                email: "user@example.com",
                password: "secure-password"
            },
            response: {
                success: true,
                message: "Login successful",
                token: "jwt-token-here",
                user: {
                    id: "user-id",
                    email: "user@example.com",
                    name: "John Doe",
                    lastLogin: "2026-03-27T10:30:00Z"
                }
            }
        }
    }
};

export const SETUP_GUIDES = {
  localMode: {
    title: " Local Setup (No Database Required)",
    steps: [
      {
        title: "Download ClipHub",
        description: "Clone or download the ClipHub repository",
        code: "git clone https://github.com/Yug1275/cliphub.git\ncd cliphub"
      },
      {
        title: "Start the Environment", 
        description: "Install dependencies and launch both frontend and local-server. Local mode uses /local-server and requires NO Mongo/Redis setup!",
        code: `npm install\nnpm run dev:local\n\n# Or start them individually:\n# cd local-server && npm i && npm run dev\n# cd client && npm i && npm run dev`
      }
    ]
  },
  globalMode: {
    title: " Global Mode Setup",
    steps: [
      {
        title: "Download Component",
        description: "",
        code: "git clone https://github.com/Yug1275/cliphub.git\ncd cliphub\nnpm install"
      },
      {
        title: "Requirements",
        description: "Set up MongoDB and Redis for production scaling.",
        code: `# Ensure MongoDB and Redis are installed
# Update server/.env
REDIS_URL=redis://127.0.0.1:6379
MONGO_URI=mongodb://localhost:27017/cliphub`
      },
      {
         title: "Start the Server",
         description: "",
         code: "npm run dev:global"
      }
    ]
  }
};
