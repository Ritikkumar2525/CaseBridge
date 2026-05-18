<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use App\Mail\ContactMessage;

class ContactController extends Controller
{
    public function submit(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|email',
            'message' => 'required|string|max:2000'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        try {
            // Retrieve destination email gracefully falling back to exactly where it was authenticated from
            $adminEmail = env('MAIL_FROM_ADDRESS') ?? 'support@casebridge.dev';
            
            Mail::to($adminEmail)->send(new ContactMessage($request->name, $request->email, $request->message));
            
            return response()->json(['success' => true, 'message' => 'Your message has been received!']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to send message: ' . $e->getMessage()], 500);
        }
    }
}
