<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Organization;
use App\Models\Complaint;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

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
        // ─── Super Admin ─────────────────────────────────────────
        $this->call([
            UserSeeder::class,
        ]);
        $superAdmin = User::where('email', 'admin@casebridge.dev')->first();

        echo "✅ Super Admin created: admin@casebridge.dev / Admin@#2005\n";

        // ─── Organizations ───────────────────────────────────────

        $college = Organization::create([
            'name' => 'Delhi Technical University',
            'slug' => 'delhi-tech-university',
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
        ]);

        $hospital = Organization::create([
            'name' => 'City General Hospital',
            'slug' => 'city-general-hospital',
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
        ]);

        echo "✅ 2 Organizations created\n";

        // ─── Organization Admins ─────────────────────────────────

        $collegeAdmin = User::create([
            'name' => 'Dr. Rajesh Kumar',
            'email' => 'rajesh@dtu.edu',
            'password' => 'password123',
            'role' => 'org_admin',
            'organization_id' => (string) $college->_id,
        ]);

        $hospitalAdmin = User::create([
            'name' => 'Dr. Priya Sharma',
            'email' => 'priya@citygeneral.org',
            'password' => 'password123',
            'role' => 'org_admin',
            'organization_id' => (string) $hospital->_id,
        ]);

        echo "✅ 2 Org Admins created\n";

        // ─── Staff Members ───────────────────────────────────────

        $collegeStaff1 = User::create([
            'name' => 'Amit Verma',
            'email' => 'amit@dtu.edu',
            'password' => 'password123',
            'role' => 'staff',
            'organization_id' => (string) $college->_id,
        ]);

        $collegeStaff2 = User::create([
            'name' => 'Neha Gupta',
            'email' => 'neha@dtu.edu',
            'password' => 'password123',
            'role' => 'staff',
            'organization_id' => (string) $college->_id,
        ]);

        $hospitalStaff1 = User::create([
            'name' => 'Ravi Singh',
            'email' => 'ravi@citygeneral.org',
            'password' => 'password123',
            'role' => 'staff',
            'organization_id' => (string) $hospital->_id,
        ]);

        $hospitalStaff2 = User::create([
            'name' => 'Sunita Patel',
            'email' => 'sunita@citygeneral.org',
            'password' => 'password123',
            'role' => 'staff',
            'organization_id' => (string) $hospital->_id,
        ]);

        echo "✅ 4 Staff members created\n";

        // ─── Regular Users ───────────────────────────────────────

        $user1 = User::create([
            'name' => 'Arjun Mehta',
            'email' => 'arjun@example.com',
            'password' => 'password123',
            'role' => 'user',
            'organization_id' => (string) $college->_id,
        ]);

        $user2 = User::create([
            'name' => 'Kavita Joshi',
            'email' => 'kavita@example.com',
            'password' => 'password123',
            'role' => 'user',
            'organization_id' => (string) $college->_id,
        ]);

        $user3 = User::create([
            'name' => 'Rohit Sharma',
            'email' => 'rohit@example.com',
            'password' => 'password123',
            'role' => 'user',
            'organization_id' => (string) $hospital->_id,
        ]);

        $user4 = User::create([
            'name' => 'Meera Kapoor',
            'email' => 'meera@example.com',
            'password' => 'password123',
            'role' => 'user',
            'organization_id' => (string) $hospital->_id,
        ]);

        echo "✅ 4 Users created\n";

        // ─── Sample Complaints ───────────────────────────────────

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

        echo "✅ 10 Sample complaints created\n";
        echo "\n🎉 Seeding complete! You can login with:\n";
        echo "   Super Admin:  admin@casebridge.dev     / password123\n";
        echo "   Org Admin:    rajesh@dtu.edu            / password123\n";
        echo "   Staff:        amit@dtu.edu              / password123\n";
        echo "   User:         arjun@example.com         / password123\n";
    }
}
