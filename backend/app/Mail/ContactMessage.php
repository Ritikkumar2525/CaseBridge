<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactMessage extends Mailable
{
    use Queueable, SerializesModels;

    public $name;
    public $email;
    public $userMessage;

    public function __construct($name, $email, $message)
    {
        $this->name = $name;
        $this->email = $email;
        $this->userMessage = $message;
    }

    public function build()
    {
        return $this->subject('New CaseBridge Support Inquiry from ' . $this->name)
                    ->replyTo($this->email)
                    ->html('
                        <div style="font-family: sans-serif; padding: 20px;">
                            <h2 style="color: #3b82f6;">New CaseBridge Inquiry</h2>
                            <p><strong>Name:</strong> ' . htmlspecialchars($this->name) . '</p>
                            <p><strong>Reply-To Email:</strong> ' . htmlspecialchars($this->email) . '</p>
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                            <p style="white-space: pre-wrap;">' . htmlspecialchars($this->userMessage) . '</p>
                        </div>
                    ');
    }
}
