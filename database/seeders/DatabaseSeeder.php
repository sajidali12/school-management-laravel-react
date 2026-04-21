<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\ExpenseCategory;
use App\Models\FeeCategory;
use App\Models\FeeStructure;
use App\Models\Institution;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'root@sms.test'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'institution_id' => null,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );

        $demo = Institution::updateOrCreate(
            ['slug' => 'demo'],
            [
                'name' => 'Al-Falah Public School',
                'primary_color' => '#0f766e',
                'status' => 'active',
                'tagline' => 'Learn. Lead. Inspire.',
                'principal_name' => 'Dr. Kamran Sheikh',
                'email' => 'info@alfalah.test',
                'phone' => '+92 42 35678900',
                'website' => 'https://alfalah.test',
                'city' => 'Lahore',
                'address' => '23 Jail Road, Gulberg III, Lahore, Pakistan',
                'registration_number' => 'PEIRA-LHR-2003-0142',
                'established_year' => 2003,
                'currency' => 'PKR',
            ],
        );

        app()->instance('currentInstitution', $demo);

        User::updateOrCreate(
            ['email' => 'admin@sms.test'],
            [
                'name' => 'Demo Admin',
                'password' => Hash::make('password'),
                'role' => 'institution_admin',
                'institution_id' => $demo->id,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );

        if (SchoolClass::count() > 0) {
            return;
        }

        $maleFirst = ['Ahmed', 'Ali', 'Hassan', 'Hussain', 'Bilal', 'Usman', 'Omar', 'Imran', 'Faisal', 'Asad', 'Zain', 'Hamza', 'Tariq', 'Khalid', 'Saad', 'Arslan', 'Fahad', 'Salman', 'Zeeshan', 'Kamran', 'Abdullah', 'Hamid', 'Junaid', 'Rehan', 'Waqas'];
        $femaleFirst = ['Ayesha', 'Fatima', 'Zainab', 'Hira', 'Sana', 'Maryam', 'Amna', 'Hina', 'Sadia', 'Noor', 'Laiba', 'Kiran', 'Saba', 'Rabia', 'Iqra', 'Mehwish', 'Anum', 'Sumaira', 'Nida', 'Javeria', 'Aisha', 'Khadija', 'Hafsa', 'Zara', 'Maham'];
        $lastNames = ['Khan', 'Ahmed', 'Ali', 'Hussain', 'Malik', 'Sheikh', 'Siddiqui', 'Qureshi', 'Chaudhry', 'Raza', 'Akhtar', 'Butt', 'Awan', 'Baig', 'Mirza', 'Shah', 'Abbasi', 'Rizvi', 'Farooq', 'Iqbal'];

        $pickName = function (?string $gender = null) use ($maleFirst, $femaleFirst, $lastNames): array {
            $g = $gender ?? (random_int(0, 1) ? 'male' : 'female');
            $pool = $g === 'male' ? $maleFirst : $femaleFirst;

            return [
                'first' => $pool[array_rand($pool)],
                'last' => $lastNames[array_rand($lastNames)],
                'gender' => $g,
            ];
        };

        $paPhone = fn () => '+92 3' . random_int(0, 4) . ' ' . random_int(1000000, 9999999);

        $subjectsData = [
            ['code' => 'URD', 'name' => 'Urdu'],
            ['code' => 'ENG', 'name' => 'English'],
            ['code' => 'MTH', 'name' => 'Mathematics'],
            ['code' => 'SCI', 'name' => 'General Science'],
            ['code' => 'ISL', 'name' => 'Islamiat'],
            ['code' => 'PST', 'name' => 'Pakistan Studies'],
            ['code' => 'COMP', 'name' => 'Computer Science'],
            ['code' => 'PHY', 'name' => 'Physics'],
            ['code' => 'CHEM', 'name' => 'Chemistry'],
            ['code' => 'BIO', 'name' => 'Biology'],
        ];
        $subjects = collect($subjectsData)->map(fn ($s) => Subject::create($s + [
            'description' => "Core subject: {$s['name']}.",
            'is_active' => true,
        ]));

        $designations = ['Senior Teacher', 'Teacher', 'Head of Department', 'Subject Specialist'];
        $qualifications = ['M.A. Education', 'M.Sc.', 'B.Ed.', 'M.Phil', 'MA English', 'BS Computer Science'];
        $teachers = collect();
        for ($i = 1; $i <= 16; $i++) {
            $n = $pickName();
            $spec = $subjectsData[array_rand($subjectsData)]['name'];
            $teachers->push(Teacher::create([
                'employee_id' => 'TCH-' . str_pad((string) $i, 3, '0', STR_PAD_LEFT),
                'first_name' => $n['first'],
                'last_name' => $n['last'],
                'email' => strtolower("{$n['first']}.{$n['last']}.{$i}@alfalah.test"),
                'phone' => $paPhone(),
                'designation' => $designations[array_rand($designations)],
                'qualification' => $qualifications[array_rand($qualifications)],
                'specialization' => $spec,
                'joining_date' => now()->subYears(random_int(1, 15))->subMonths(random_int(0, 11))->format('Y-m-d'),
                'date_of_birth' => now()->subYears(random_int(28, 55))->format('Y-m-d'),
                'gender' => $n['gender'],
                'status' => 'active',
            ]));
        }

        $classesData = [
            ['name' => 'Class 1', 'level' => 1],
            ['name' => 'Class 2', 'level' => 2],
            ['name' => 'Class 3', 'level' => 3],
            ['name' => 'Class 4', 'level' => 4],
            ['name' => 'Class 5', 'level' => 5],
            ['name' => 'Class 6', 'level' => 6],
            ['name' => 'Class 7', 'level' => 7],
            ['name' => 'Class 8', 'level' => 8],
            ['name' => 'Class 9 (Matric)', 'level' => 9],
            ['name' => 'Class 10 (Matric)', 'level' => 10],
            ['name' => 'FSc Part 1', 'level' => 11],
            ['name' => 'FSc Part 2', 'level' => 12],
        ];

        $feeCategoryDefs = [
            ['name' => 'Tuition Fee', 'frequency' => 'monthly', 'description' => 'Monthly tuition charge.'],
            ['name' => 'Admission Fee', 'frequency' => 'one_time', 'description' => 'One-time admission charge.'],
            ['name' => 'Examination Fee', 'frequency' => 'quarterly', 'description' => 'Term examination fee.'],
            ['name' => 'Transport Fee', 'frequency' => 'monthly', 'description' => 'School van service.'],
            ['name' => 'Annual Charges', 'frequency' => 'annual', 'description' => 'Annual development charges.'],
        ];
        $feeCategories = collect($feeCategoryDefs)->mapWithKeys(fn ($c) => [
            $c['name'] => FeeCategory::create($c + ['is_active' => true]),
        ]);

        ExpenseCategory::insert([
            ['institution_id' => $demo->id, 'name' => 'Salaries', 'description' => 'Staff payroll.', 'created_at' => now(), 'updated_at' => now()],
            ['institution_id' => $demo->id, 'name' => 'Utilities', 'description' => 'Electricity, water, gas, internet.', 'created_at' => now(), 'updated_at' => now()],
            ['institution_id' => $demo->id, 'name' => 'Supplies', 'description' => 'Stationery and classroom supplies.', 'created_at' => now(), 'updated_at' => now()],
            ['institution_id' => $demo->id, 'name' => 'Maintenance', 'description' => 'Repairs and cleaning.', 'created_at' => now(), 'updated_at' => now()],
            ['institution_id' => $demo->id, 'name' => 'Transport', 'description' => 'Fuel and vehicle upkeep.', 'created_at' => now(), 'updated_at' => now()],
        ]);

        $cashAccount = Account::create([
            'name' => 'Cash In Hand',
            'type' => 'cash',
            'opening_balance' => 50000,
            'is_active' => true,
        ]);
        Account::create([
            'name' => 'Allied Bank - Main',
            'type' => 'bank',
            'bank_name' => 'Allied Bank Limited',
            'account_number' => '0010-0123456789',
            'opening_balance' => 750000,
            'is_active' => true,
        ]);
        Account::create([
            'name' => 'JazzCash Wallet',
            'type' => 'wallet',
            'account_number' => '03001234567',
            'opening_balance' => 20000,
            'is_active' => true,
        ]);

        Transaction::create([
            'account_id' => $cashAccount->id,
            'expense_category_id' => ExpenseCategory::where('name', 'Supplies')->value('id'),
            'type' => 'expense',
            'amount' => 8500,
            'date' => now()->subDays(5)->format('Y-m-d'),
            'description' => 'Whiteboard markers and classroom stationery',
            'reference' => 'RCPT-4421',
        ]);

        $sectionNames = ['A', 'B', 'C'];
        $studentCounter = 1;

        foreach ($classesData as $cd) {
            $class = SchoolClass::create($cd + [
                'description' => "{$cd['name']} curriculum and activities.",
            ]);

            $tuition = match (true) {
                $cd['level'] <= 5 => 2500,
                $cd['level'] <= 8 => 3500,
                $cd['level'] <= 10 => 4500,
                default => 6000,
            };
            FeeStructure::create([
                'school_class_id' => $class->id,
                'fee_category_id' => $feeCategories['Tuition Fee']->id,
                'amount' => $tuition,
            ]);
            FeeStructure::create([
                'school_class_id' => $class->id,
                'fee_category_id' => $feeCategories['Examination Fee']->id,
                'amount' => $cd['level'] <= 8 ? 1000 : 1500,
            ]);
            FeeStructure::create([
                'school_class_id' => $class->id,
                'fee_category_id' => $feeCategories['Annual Charges']->id,
                'amount' => $cd['level'] <= 8 ? 5000 : 8000,
            ]);

            $classSubjects = $cd['level'] <= 8
                ? $subjects->whereIn('code', ['URD', 'ENG', 'MTH', 'SCI', 'ISL', 'PST', 'COMP'])->pluck('id')
                : ($cd['level'] <= 10
                    ? $subjects->whereIn('code', ['URD', 'ENG', 'MTH', 'ISL', 'PST', 'PHY', 'CHEM', 'BIO', 'COMP'])->pluck('id')
                    : $subjects->whereIn('code', ['ENG', 'URD', 'ISL', 'PHY', 'CHEM', 'BIO', 'MTH', 'COMP'])->pluck('id'));
            $class->subjects()->sync($classSubjects->all());

            foreach ($sectionNames as $sIndex => $sName) {
                $section = Section::create([
                    'school_class_id' => $class->id,
                    'class_teacher_id' => $teachers->random()->id,
                    'name' => $sName,
                    'room' => 'Room ' . ($cd['level'] * 10 + $sIndex + 1),
                    'capacity' => 35,
                ]);

                $count = random_int(18, 28);
                for ($i = 1; $i <= $count; $i++) {
                    $n = $pickName();
                    $guardian = $pickName('male');
                    $year = (int) date('Y') - max(0, 12 - $cd['level']);
                    $roll = str_pad((string) $studentCounter++, 4, '0', STR_PAD_LEFT);
                    Student::create([
                        'section_id' => $section->id,
                        'roll_number' => $roll,
                        'first_name' => $n['first'],
                        'last_name' => $n['last'],
                        'email' => strtolower("{$n['first']}.{$n['last']}.{$roll}@student.alfalah.test"),
                        'phone' => $paPhone(),
                        'date_of_birth' => now()->subYears(5 + $cd['level'])->subMonths(random_int(0, 11))->format('Y-m-d'),
                        'gender' => $n['gender'],
                        'guardian_name' => "{$guardian['first']} {$n['last']}",
                        'guardian_phone' => $paPhone(),
                        'admission_year' => $year,
                        'status' => 'active',
                    ]);
                }
            }
        }
    }
}
