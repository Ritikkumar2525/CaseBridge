<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public $otp;

    /**
     * Create a new message instance.
     */
    public function __construct(string $otp)
    {
        $this->otp = $otp;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'CaseBridge Password Reset Code',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            htmlString: "<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;'>
                            <h2 style='color: #111827;'>Password Reset Request</h2>
                            <p style='color: #4b5563; font-size: 16px; line-height: 1.5;'>We received a request to reset your password for CaseBridge. Your 6-digit confirmation code is:</p>
                            <div style='background-color: #f3f4f6; border-radius: 6px; padding: 16px; text-align: center; margin: 24px 0;'>
                                <span style='font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1f2937;'>{$this->otp}</span>
                            </div>
                            <p style='color: #6b7280; font-size: 14px;'>This code will expire in 15 minutes. If you did not request a password reset, please ignore this email.</p>
                         </div>",
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
