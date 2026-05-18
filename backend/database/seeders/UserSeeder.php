<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@casebridge.dev'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('Admin@#2005'),
                'role' => 'super_admin',
                'is_active' => true,
            ]
        );
    }
}
