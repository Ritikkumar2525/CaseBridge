<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Organization;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Fetch seeded organizations to associate users correctly
        $college = Organization::where('slug', 'delhi-tech-university')->first();
        $hospital = Organization::where('slug', 'city-general-hospital')->first();

        $collegeId = $college ? (string) $college->_id : null;
        $hospitalId = $hospital ? (string) $hospital->_id : null;

        // 1. Super Admin
        User::updateOrCreate(
            ['email' => 'admin@casebridge.dev'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('Demo@123'),
                'role' => 'super_admin',
                'is_active' => true,
            ]
        );

        // 2. Organization Admins
        User::updateOrCreate(
            ['email' => 'rajesh@dtu.edu'],
            [
                'name' => 'Dr. Rajesh Kumar',
                'password' => Hash::make('Demo@123'),
                'role' => 'org_admin',
                'organization_id' => $collegeId,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'priya@citygeneral.org'],
            [
                'name' => 'Dr. Priya Sharma',
                'password' => Hash::make('Demo@123'),
                'role' => 'org_admin',
                'organization_id' => $hospitalId,
                'is_active' => true,
            ]
        );

        // 3. Staff Members
        User::updateOrCreate(
            ['email' => 'amit@dtu.edu'],
            [
                'name' => 'Amit Verma',
                'password' => Hash::make('Demo@123'),
                'role' => 'staff',
                'organization_id' => $collegeId,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'neha@dtu.edu'],
            [
                'name' => 'Neha Gupta',
                'password' => Hash::make('Demo@123'),
                'role' => 'staff',
                'organization_id' => $collegeId,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'ravi@citygeneral.org'],
            [
                'name' => 'Ravi Singh',
                'password' => Hash::make('Demo@123'),
                'role' => 'staff',
                'organization_id' => $hospitalId,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'sunita@citygeneral.org'],
            [
                'name' => 'Sunita Patel',
                'password' => Hash::make('Demo@123'),
                'role' => 'staff',
                'organization_id' => $hospitalId,
                'is_active' => true,
            ]
        );

        // 4. Regular Users
        User::updateOrCreate(
            ['email' => 'arjun@example.com'],
            [
                'name' => 'Arjun Mehta',
                'password' => Hash::make('Demo@123'),
                'role' => 'user',
                'organization_id' => $collegeId,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'kavita@example.com'],
            [
                'name' => 'Kavita Joshi',
                'password' => Hash::make('Demo@123'),
                'role' => 'user',
                'organization_id' => $collegeId,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'rohit@example.com'],
            [
                'name' => 'Rohit Sharma',
                'password' => Hash::make('Demo@123'),
                'role' => 'user',
                'organization_id' => $hospitalId,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'meera@example.com'],
            [
                'name' => 'Meera Kapoor',
                'password' => Hash::make('Demo@123'),
                'role' => 'user',
                'organization_id' => $hospitalId,
                'is_active' => true,
            ]
        );
    }
}
