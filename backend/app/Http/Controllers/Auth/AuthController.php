<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
use App\Mail\OtpMail;
use Illuminate\Support\Str;
use Carbon\Carbon;
use GuzzleHttp\Client;
use Laravel\Socialite\Facades\Socialite;

/**
 * Authentication Controller
 *
 * Handles JWT-based authentication: register, login, logout, refresh, profile.
 */
class AuthController extends Controller
{
    /**
     * Register a new user.
     *
     * POST /api/auth/register
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:2|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'string', 'confirmed', Password::min(8)->mixedCase()->letters()->numbers()->symbols()],
            'role' => 'sometimes|in:user,staff,org_admin',
            'organization_id' => 'required_if:role,user,staff|string',
            'organization_name' => 'required_if:role,org_admin|string|min:2|max:200',
            'phone' => 'sometimes|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Respect the role explicitly requested by the frontend UI
        $role = $request->input('role', 'user');
        $orgId = $request->organization_id;

        if ($role === 'org_admin') {
            $org = \App\Models\Organization::create([
                'name' => $request->organization_name,
                'slug' => \Illuminate\Support\Str::slug($request->organization_name) . '-' . \Illuminate\Support\Str::random(4),
                'type' => 'other',
                'is_active' => true,
                'contact_email' => $request->email,
                'settings' => [
                    'categories' => ['General', 'Technical', 'Billing'],
                    'auto_assign' => false,
                ],
            ]);
            $orgId = (string) $org->_id;
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password, // Auto-hashed via cast
            'role' => $role,
            'organization_id' => $orgId,
            'phone' => $request->phone,
            'is_active' => true,
        ]);

        if ($role === 'org_admin' && isset($org)) {
            $org->update(['created_by' => (string) $user->_id]);
        }

        // Generate JWT token for the new user
        $token = auth('api')->login($user);

        return response()->json([
            'success' => true,
            'message' => 'Registration successful.',
            'data' => [
                'user' => $this->formatUser($user),
                'token' => $this->tokenResponse($token),
            ],
        ], 201);
    }

    /**
     * Login with email and password.
     *
     * POST /api/auth/login
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
            'role' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $credentials = $request->only('email', 'password');

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        $user = auth('api')->user();

        // Validate that the user is actually logging into the correct explicit portal
        if ($request->has('role') && $user->role !== $request->role) {
            auth('api')->logout();
            return response()->json([
                'success' => false,
                'message' => 'Access Denied: Your account does not have privileges for the selected portal role.',
            ], 403);
        }
        // Check if user account is active
        if (!$user->is_active) {
            auth('api')->logout();
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Contact support.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'data' => [
                'user' => $this->formatUser($user),
                'token' => $this->tokenResponse($token),
            ],
        ]);
    }

    /**
     * Send OTP for Forgot Password.
     *
     * POST /api/auth/forgot-password
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation failed.', 'errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'We could not find an account with that email.'], 404);
        }

        $otp = sprintf("%06d", mt_rand(1, 999999));
        $user->otp = $otp;
        $user->otp_expires_at = Carbon::now()->addMinutes(15);
        $user->save();

        Mail::to($user->email)->send(new OtpMail($otp));

        return response()->json(['success' => true, 'message' => 'A password reset code has been sent to your email.']);
    }

    /**
     * Reset Password using OTP.
     *
     * POST /api/auth/reset-password-otp
     */
    public function resetPasswordOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'password' => ['required', 'string', 'confirmed', Password::min(8)->mixedCase()->letters()->numbers()->symbols()]
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation failed.', 'errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || $user->otp !== $request->otp || Carbon::now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired OTP code.'], 400);
        }

        $user->password = $request->password;
        $user->otp = null;
        $user->otp_expires_at = null;
        $user->save();

        return response()->json(['success' => true, 'message' => 'Password has been reset successfully.']);
    }

    /**
     * Google OAuth SSO Login/Registration.
     *
     * POST /api/auth/google
     */
    public function googleLogin(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'credential' => 'required|string',
            'role' => 'sometimes|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Missing Google credential.'], 422);
        }

        $accessToken = $request->credential;
        $client = new Client();
        
        try {
            // Verify access token via Google's userinfo endpoint
            $response = $client->get('https://www.googleapis.com/oauth2/v3/userinfo', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ]
            ]);
            $payload = json_decode($response->getBody(), true);

            if (!isset($payload['email'])) {
                throw new \Exception('Invalid token payload structure.');
            }

            $user = User::where('email', $payload['email'])->first();

            // Explicitly validate that an existing Google user isn't logging into the wrong portal
            if ($user && $request->has('role') && $user->role !== $request->role) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access Denied: Your account does not have privileges for the selected portal role.',
                ], 403);
            }

            if (!$user) {
                // Auto register new Google user mapped natively to their UI selection
                $role = $request->input('role', 'user');
                $user = User::create([
                    'name' => $payload['name'] ?? 'Google User',
                    'email' => $payload['email'],
                    'password' => Str::random(24),
                    'role' => $role,
                    'is_active' => true,
                    'google_id' => $payload['sub'] ?? null,
                    'avatar' => $payload['picture'] ?? null,
                ]);
            } else {
                // Update google_id if it was a manual registration converted to Google SSO
                if (!$user->google_id && isset($payload['sub'])) {
                    $user->google_id = $payload['sub'];
                    $user->save();
                }
            }

            $token = auth('api')->login($user);

            return response()->json([
                'success' => true,
                'message' => 'Google Login successful.',
                'data' => [
                    'user' => $this->formatUser($user),
                    'token' => $this->tokenResponse($token),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired Google Token.', 'error' => $e->getMessage()], 401);
        }
    }

    /**
     * Redirect the user to the Google authentication page.
     *
     * GET /api/auth/google
     */
    public function googleRedirect(\Illuminate\Http\Request $request)
    {
        $frontendUrl = $request->headers->get('referer');
        
        if ($frontendUrl) {
            $parsed = parse_url($frontendUrl);
            $frontendUrl = ($parsed['scheme'] ?? 'https') . '://' . ($parsed['host'] ?? 'localhost') . (isset($parsed['port']) ? ':' . $parsed['port'] : '');
        } else {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        }

        return Socialite::driver('google')
            ->stateless()
            ->redirect()
            ->withCookie(cookie('cb_frontend_url', $frontendUrl, 10, null, null, false, true, false, 'None'));
    }

    /**
     * Obtain the user information from Google and authenticate.
     *
     * GET /api/auth/google/callback
     */
    public function googleCallback(\Illuminate\Http\Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            if (!$googleUser->getEmail()) {
                return response()->json(['success' => false, 'message' => 'No email returned from Google.'], 400);
            }

            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // Auto register new Google user
                $user = User::create([
                    'name' => $googleUser->getName() ?? 'Google User',
                    'email' => $googleUser->getEmail(),
                    'password' => Str::random(24),
                    'role' => 'user', // default role
                    'is_active' => true,
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]);
            } else {
                // Update google_id and avatar if it was a manual registration converted to Google SSO
                if (!$user->google_id) {
                    $user->google_id = $googleUser->getId();
                    if ($googleUser->getAvatar()) {
                        $user->avatar = $googleUser->getAvatar();
                    }
                    $user->save();
                }
            }

            $token = auth('api')->login($user);
            
            // Retrieve the original frontend URL from cookie, fallback to env
            $frontendUrl = $request->cookie('cb_frontend_url') ?? env('FRONTEND_URL', 'http://localhost:5173');
            
            // Redirect back to frontend success page with token
            return redirect($frontendUrl . '/auth/success?token=' . $token)
                ->withoutCookie('cb_frontend_url');
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Google Authentication failed.', 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Logout (invalidate the token).
     *
     * POST /api/auth/logout
     */
    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out.',
        ]);
    }

    /**
     * Refresh the JWT token.
     *
     * POST /api/auth/refresh
     */
    public function refresh(): JsonResponse
    {
        $token = auth('api')->refresh();
        $user = auth('api')->user();

        return response()->json([
            'success' => true,
            'message' => 'Token refreshed.',
            'data' => [
                'user' => $this->formatUser($user),
                'token' => $this->tokenResponse($token),
            ],
        ]);
    }

    /**
     * Get the authenticated user's profile.
     *
     * GET /api/auth/me
     */
    public function me(): JsonResponse
    {
        $user = auth('api')->user();
        $user->load('organization');

        return response()->json([
            'success' => true,
            'data' => $this->formatUser($user),
        ]);
    }

    /**
     * Update the authenticated user's profile.
     *
     * PUT /api/auth/profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = auth('api')->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|min:2|max:100',
            'phone' => 'sometimes|string|max:20',
            'avatar' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->update($request->only(['name', 'phone', 'avatar']));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated.',
            'data' => $this->formatUser($user->fresh()),
        ]);
    }

    // ─── Private Helpers ─────────────────────────────────────────

    /**
     * Format user data for API response.
     */
    private function formatUser(User $user): array
    {
        return [
            'id' => (string) $user->_id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'organization_id' => $user->organization_id,
            'organization' => $user->relationLoaded('organization') ? $user->organization : null,
            'avatar' => $user->avatar,
            'phone' => $user->phone,
            'is_active' => $user->is_active,
            'created_at' => $user->created_at?->toISOString(),
        ];
    }

    /**
     * Format token response with metadata.
     */
    private function tokenResponse(string $token): array
    {
        return [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
        ];
    }
}
