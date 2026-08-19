import { toast } from "react-toastify";
import { DEFAULT_HEADERS, GLOBAL_BASE_URL } from "../api/client";
import { useAuth } from "./context/AuthContext";

function Test() {
    const { token, setAuth } = useAuth();

    const tryRefresh = async () => {
        try {
            const response = await fetch(`${GLOBAL_BASE_URL}/auth/refresh`, {
                method: "POST",
                credentials: "include",
            });
            if (response.ok) {
                const json = await response.json();
                console.log(json);
                setAuth(json.accessToken, json.roles);
            } else if (response.status === 401) {
                setAuth(null, []);
                window.location.href = "/login";
            } else {

            }
        } catch {
            // no valid session, stay logged out
        }
    };

    const handleSubmit = async () => {
        const user = {
            "username": "testuser",
            "password": "1234"
        };

        console.log("Token on Test fuction : " + token);

        try {
            const headers: Record<string, string> = {
                ...DEFAULT_HEADERS,
            };

            if (token) {
                headers['Authorization'] = 'Bearer ' + token;
            } else {
                console.warn('No auth token available; request will be sent without Authorization header');
            }

            const response = await fetch(`${GLOBAL_BASE_URL}/test`, {
                method: "POST",
                credentials: "include",
                headers,
                body: JSON.stringify(user)
            });

            if (response.ok) {
                const json = await response.json();
                console.log(json);
            } else if (response.status === 401) {
                tryRefresh();
            } else {
                console.log(response);
                toast.error("Error : " + response.status + ", " + response.statusText + ". Please try again");
            }
        } catch (error) {
            toast.error("Something Wrong : " + error);
            console.error("Error:", error);
        }
    }

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 font-sans antialiased">
            {/* Decorative background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Main Testing Card */}
            <div className="relative z-10 w-full max-w-md mx-4 p-8 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-2xl shadow-indigo-950/50 flex flex-col items-center text-center">

                {/* Icon / Visual Anchor */}
                <div className="mb-6 p-4 bg-indigo-500/10 rounded-full text-indigo-400 border border-indigo-500/20">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                {/* Header */}
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent mb-2">
                    Test Page
                </h1>

                <p className="text-sm text-slate-400 mb-8 max-w-xs">
                    Click the button below to verify your trigger configuration and action workflows.
                </p>

                {/* Action Button */}
                <button
                    onClick={handleSubmit}
                    className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 active:scale-[0.98] shadow-lg shadow-indigo-500/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                    Submit Test
                </button>
            </div>
        </div>
    )
}

export default Test
