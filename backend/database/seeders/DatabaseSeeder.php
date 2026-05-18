<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Organization;
use App\Models\Complaint;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

/**
 * Database Seeder
 *
 * Creates demo data for development:
 * - 1 Super Admin
 * - 2 Organizations (College + Hospital)
 * - 2 Org Admins (one per org)
 * - 4 Staff members (2 per org)
 * - 4 Regular users (2 per org)
 * - 10 Sample complaints
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─── 1. Super Admin ─────────────────────────────────────────
        // Seed Super Admin first (no organization needed)
        $superAdmin = User::updateOrCreate(
            ['email' => 'admin@casebridge.dev'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('Demo@123'),
                'role' => 'super_admin',
                'is_active' => true,
            ]
        );

        echo "✅ Super Admin created: admin@casebridge.dev / Demo@123\n";

        // ─── 2. Organizations ───────────────────────────────────────
        $college = Organization::updateOrCreate(
            ['slug' => 'delhi-tech-university'],
            [
                'name' => 'Delhi Technical University',
                'type' => 'college',
                'description' => 'A premier technical university in Delhi',
                'contact_email' => 'admin@dtu.edu',
                'contact_phone' => '+91-11-27871018',
                'address' => 'Shahbad Daulatpur, Bawana Road, Delhi-110042',
                'created_by' => (string) $superAdmin->_id,
                'settings' => [
                    'auto_assign' => false,
                    'escalation_days' => 5,
                    'categories' => ['Academic', 'Hostel', 'Infrastructure', 'Library', 'Sports', 'General'],
                ],
            ]
        );

        $hospital = Organization::updateOrCreate(
            ['slug' => 'city-general-hospital'],
            [
                'name' => 'City General Hospital',
                'type' => 'hospital',
                'description' => 'Multi-specialty hospital serving the community',
                'contact_email' => 'admin@citygeneral.org',
                'contact_phone' => '+91-11-23456789',
                'address' => 'Connaught Place, New Delhi-110001',
                'created_by' => (string) $superAdmin->_id,
                'settings' => [
                    'auto_assign' => true,
                    'escalation_days' => 3,
                    'categories' => ['Patient Care', 'Billing', 'Emergency', 'Staff', 'Facilities', 'General'],
                ],
            ]
        );

        echo "✅ 2 Organizations created\n";

        // ─── 3. Run User Seeder (Idempotent updateOrCreate) ────────
        // This will create all org admins, staff members, and regular users with Demo@123 password
        $this->call([
            UserSeeder::class,
        ]);

        echo "✅ All demo accounts seeded successfully!\n";

        // Fetch users to assign complaints correctly
        $collegeStaff1 = User::where('email', 'amit@dtu.edu')->first();
        $collegeStaff2 = User::where('email', 'neha@dtu.edu')->first();
        $hospitalStaff1 = User::where('email', 'ravi@citygeneral.org')->first();
        $hospitalStaff2 = User::where('email', 'sunita@citygeneral.org')->first();

        $user1 = User::where('email', 'arjun@example.com')->first();
        $user2 = User::where('email', 'kavita@example.com')->first();
        $user3 = User::where('email', 'rohit@example.com')->first();
        $user4 = User::where('email', 'meera@example.com')->first();

        // ─── 4. Sample Complaints (Delete old first to keep it clean) ─
        Complaint::truncate();

        $complaints = [
            [
                'title' => 'Wi-Fi connectivity issues in Hostel Block B',
                'description' => 'The Wi-Fi has been extremely slow and disconnects frequently in Hostel Block B. This has been going on for the past week and is affecting our studies and online submissions.',
                'priority' => 'high',
                'category' => 'Infrastructure',
                'organization_id' => (string) $college->_id,
                'user_id' => (string) $user1->_id,
                'status' => 'ASSIGNED',
                'assigned_staff_id' => (string) $collegeStaff1->_id,
            ],
            [
                'title' => 'Library AC not working',
                'description' => 'The air conditioning in the main library reading hall has stopped working. With summer approaching, it is becoming very uncomfortable to study there.',
                'priority' => 'medium',
                'category' => 'Infrastructure',
                'organization_id' => (string) $college->_id,
                'user_id' => (string) $user2->_id,
                'status' => 'IN_PROGRESS',
                'assigned_staff_id' => (string) $collegeStaff2->_id,
            ],
            [
                'title' => 'Late fee charged incorrectly',
                'description' => 'I returned my library books on time but was charged a late fee of ₹500. The receipt shows the correct return date but the system still charged me.',
                'priority' => 'low',
                'category' => 'Academic',
                'organization_id' => (string) $college->_id,
                'user_id' => (string) $user1->_id,
                'status' => 'CREATED',
            ],
            [
                'title' => 'Lab equipment malfunctioning',
                'description' => 'Several oscilloscopes in the Electronics Lab are not functioning properly. This is hampering our practical sessions and experiments.',
                'priority' => 'high',
                'category' => 'Academic',
                'organization_id' => (string) $college->_id,
                'user_id' => (string) $user2->_id,
                'status' => 'ESCALATED',
                'assigned_staff_id' => (string) $collegeStaff1->_id,
            ],
            [
                'title' => 'Canteen food quality deteriorated',
                'description' => 'The quality of food in the main canteen has significantly deteriorated in the last month. Several students have reported stomach issues.',
                'priority' => 'medium',
                'category' => 'General',
                'organization_id' => (string) $college->_id,
                'user_id' => (string) $user1->_id,
                'status' => 'RESOLVED',
                'assigned_staff_id' => (string) $collegeStaff2->_id,
                'resolved_at' => now()->subDays(2),
            ],
            [
                'title' => 'Long waiting time in OPD',
                'description' => 'Waited over 3 hours in the OPD despite having an appointment. The token system seems to not be working properly.',
                'priority' => 'high',
                'category' => 'Patient Care',
                'organization_id' => (string) $hospital->_id,
                'user_id' => (string) $user3->_id,
                'status' => 'ASSIGNED',
                'assigned_staff_id' => (string) $hospitalStaff1->_id,
            ],
            [
                'title' => 'Billing discrepancy',
                'description' => 'There is a discrepancy of ₹15,000 in my hospital bill. Some tests that were covered by insurance have been charged separately.',
                'priority' => 'high',
                'category' => 'Billing',
                'organization_id' => (string) $hospital->_id,
                'user_id' => (string) $user4->_id,
                'status' => 'IN_PROGRESS',
                'assigned_staff_id' => (string) $hospitalStaff2->_id,
            ],
            [
                'title' => 'Parking area needs better lighting',
                'description' => 'The basement parking area has very poor lighting, making it unsafe, especially during nighttime visits to the emergency ward.',
                'priority' => 'medium',
                'category' => 'Facilities',
                'organization_id' => (string) $hospital->_id,
                'user_id' => (string) $user3->_id,
                'status' => 'CREATED',
            ],
            [
                'title' => 'Emergency ward staff shortage',
                'description' => 'During my late-night visit, the emergency ward was severely understaffed. Only one nurse was attending to multiple critical patients.',
                'priority' => 'high',
                'category' => 'Emergency',
                'organization_id' => (string) $hospital->_id,
                'user_id' => (string) $user4->_id,
                'status' => 'ESCALATED',
                'assigned_staff_id' => (string) $hospitalStaff1->_id,
            ],
            [
                'title' => 'Clean drinking water unavailable',
                'description' => 'The water dispenser on the 3rd floor has been non-functional for over a week. Patients and visitors have no access to clean drinking water.',
                'priority' => 'medium',
                'category' => 'Facilities',
                'organization_id' => (string) $hospital->_id,
                'user_id' => (string) $user3->_id,
                'status' => 'RESOLVED',
                'assigned_staff_id' => (string) $hospitalStaff2->_id,
                'resolved_at' => now()->subDays(1),
            ],
        ];

        foreach ($complaints as $data) {
            Complaint::create($data);
        }

        echo "✅ 10 Sample complaints seeded\n";
        echo "\n🎉 Seeding complete! You can login with:\n";
        echo "   Super Admin:  admin@casebridge.dev     / Demo@123\n";
        echo "   Org Admin:    rajesh@dtu.edu            / Demo@123\n";
        echo "   Staff:        amit@dtu.edu              / Demo@123\n";
        echo "   User:         arjun@example.com         / Demo@123\n";
    }
}
