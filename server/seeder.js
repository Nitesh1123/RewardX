const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
dotenv.config()

const User = require('./models/User')
const Attendance = require('./models/Attendance')
const Performance = require('./models/Performance')
const Reward = require('./models/Reward')
const Badge = require('./models/Badge')
const Feedback = require('./models/Feedback')

mongoose.connect(process.env.MONGO_URI)

const seedAll = async () => {
  try {
    console.log('🗑️  Clearing existing data...')
    await User.deleteMany({})
    await Attendance.deleteMany({})
    await Performance.deleteMany({})
    await Reward.deleteMany({})
    await Badge.deleteMany({})
    await Feedback.deleteMany({})

    console.log('🏅 Creating badges...')

    const badges = await Badge.insertMany([
      {
        name: 'Top Performer',
        description: 'Achieved KPI score above 90',
        icon: '🏆',
        criteria: 'KPI score > 90',
        tier: 'gold'
      },
      {
        name: 'Attendance Hero',
        description: '100% attendance for a month',
        icon: '📅',
        criteria: '30 day attendance streak',
        tier: 'gold'
      },
      {
        name: 'Team Player',
        description: 'Outstanding teamwork',
        icon: '🤝',
        criteria: '5+ positive peer reviews',
        tier: 'silver'
      },
      {
        name: 'Innovator',
        description: 'Brought creative solutions',
        icon: '💡',
        criteria: 'Manager awarded innovation',
        tier: 'silver'
      },
      {
        name: 'Rising Star',
        description: 'Most improved this quarter',
        icon: '⭐',
        criteria: 'Performance improved 20%+',
        tier: 'bronze'
      },
      {
        name: 'Mentor',
        description: 'Helped onboard new employees',
        icon: '👨‍🏫',
        criteria: 'Mentored 2+ employees',
        tier: 'silver'
      },
      {
        name: 'Customer Champion',
        description: 'Exceptional customer feedback',
        icon: '🎯',
        criteria: 'Customer rating 5/5',
        tier: 'gold'
      },
      {
        name: 'Early Bird',
        description: 'Never late for 60 days',
        icon: '🌅',
        criteria: 'Zero late arrivals in 2 months',
        tier: 'bronze'
      },
      {
        name: 'Diamond Elite',
        description: 'Top 1% performer company-wide',
        icon: '💎',
        criteria: 'Overall score > 95',
        tier: 'platinum'
      },
      {
        name: 'Streak Master',
        description: '50 day attendance streak',
        icon: '🔥',
        criteria: '50 consecutive present days',
        tier: 'gold'
      }
    ])

    console.log('👥 Creating users...')

    const users = await User.insertMany([
      {
        name: 'Arjun Sharma',
        email: 'admin@rewardx.com',
        password: await bcrypt.hash('password123', 10),
        role: 'admin',
        department: 'HR',
        rewardPoints: 9999,
        totalBonuses: 50000,
        badges: [
          { badgeId: badges[8]._id, earnedAt: new Date('2024-01-15') },
          { badgeId: badges[0]._id, earnedAt: new Date('2024-02-10') }
        ],
        joinDate: new Date('2022-01-01'),
        isActive: true
      },
      {
        name: 'Priya Mehta',
        email: 'manager@rewardx.com',
        password: await bcrypt.hash('password123', 10),
        role: 'manager',
        department: 'Engineering',
        rewardPoints: 4200,
        totalBonuses: 25000,
        badges: [
          { badgeId: badges[0]._id, earnedAt: new Date('2024-01-20') },
          { badgeId: badges[5]._id, earnedAt: new Date('2024-02-15') },
          { badgeId: badges[2]._id, earnedAt: new Date('2024-03-01') }
        ],
        joinDate: new Date('2022-03-15'),
        isActive: true
      },
      {
        name: 'Rahul Verma',
        email: 'manager2@rewardx.com',
        password: await bcrypt.hash('password123', 10),
        role: 'manager',
        department: 'Sales',
        rewardPoints: 3800,
        totalBonuses: 22000,
        badges: [
          { badgeId: badges[6]._id, earnedAt: new Date('2024-01-10') },
          { badgeId: badges[3]._id, earnedAt: new Date('2024-02-20') }
        ],
        joinDate: new Date('2022-05-10'),
        isActive: true
      },
      {
        name: 'Sneha Patel',
        email: 'sneha@rewardx.com',
        password: await bcrypt.hash('password123', 10),
        role: 'employee',
        department: 'Engineering',
        rewardPoints: 3200,
        totalBonuses: 15000,
        badges: [
          { badgeId: badges[0]._id, earnedAt: new Date('2024-02-01') },
          { badgeId: badges[1]._id, earnedAt: new Date('2024-02-15') },
          { badgeId: badges[4]._id, earnedAt: new Date('2024-03-01') }
        ],
        joinDate: new Date('2023-01-10'),
        isActive: true
      },
      {
        name: 'Amit Kumar',
        email: 'amit@rewardx.com',
        password: await bcrypt.hash('password123', 10),
        role: 'employee',
        department: 'Engineering',
        rewardPoints: 2800,
        totalBonuses: 12000,
        badges: [
          { badgeId: badges[2]._id, earnedAt: new Date('2024-01-25') },
          { badgeId: badges[7]._id, earnedAt: new Date('2024-02-28') }
        ],
        joinDate: new Date('2023-02-15'),
        isActive: true
      },
      {
        name: 'Kavya Reddy',
        email: 'kavya@rewardx.com',
        password: await bcrypt.hash('password123', 10),
        role: 'employee',
        department: 'Marketing',
        rewardPoints: 2600,
        totalBonuses: 10000,
        badges: [
          { badgeId: badges[3]._id, earnedAt: new Date('2024-02-05') },
          { badgeId: badges[4]._id, earnedAt: new Date('2024-03-10') }
        ],
        joinDate: new Date('2023-03-20'),
        isActive: true
      },
      {
        name: 'Rohan Gupta',
        email: 'rohan@rewardx.com',
        password: await bcrypt.hash('password123', 10),
        role: 'employee',
        department: 'Sales',
        rewardPoints: 3500,
        totalBonuses: 18000,
        badges: [
          { badgeId: badges[6]._id, earnedAt: new Date('2024-01-30') },
          { badgeId: badges[9]._id, earnedAt: new Date('2024-02-20') },
          { badgeId: badges[0]._id, earnedAt: new Date('2024-03-05') }
        ],
        joinDate: new Date('2022-11-01'),
        isActive: true
      },
      {
        name: 'Nisha Singh',
        email: 'nisha@rewardx.com',
        password: await bcrypt.hash('password123', 10),
        role: 'employee',
        department: 'HR',
        rewardPoints: 1900,
        totalBonuses: 8000,
        badges: [
          { badgeId: badges[5]._id, earnedAt: new Date('2024-02-10') }
        ],
        joinDate: new Date('2023-06-01'),
        isActive: true
      },
      {
        name: 'Vikram Joshi',
        email: 'vikram@rewardx.com',
        password: await bcrypt.hash('password123', 10),
        role: 'employee',
        department: 'Finance',
        rewardPoints: 2100,
        totalBonuses: 9000,
        badges: [
          { badgeId: badges[7]._id, earnedAt: new Date('2024-01-20') },
          { badgeId: badges[2]._id, earnedAt: new Date('2024-03-15') }
        ],
        joinDate: new Date('2023-04-10'),
        isActive: true
      },
      {
        name: 'Anjali Nair',
        email: 'anjali@rewardx.com',
        password: await bcrypt.hash('password123', 10),
        role: 'employee',
        department: 'Operations',
        rewardPoints: 2400,
        totalBonuses: 11000,
        badges: [
          { badgeId: badges[1]._id, earnedAt: new Date('2024-02-25') },
          { badgeId: badges[4]._id, earnedAt: new Date('2024-03-20') }
        ],
        joinDate: new Date('2023-05-15'),
        isActive: true
      }
    ])

    const admin = users[0]
    const manager1 = users[1]
    const manager2 = users[2]
    const sneha = users[3]
    const amit = users[4]
    const kavya = users[5]
    const rohan = users[6]
    const nisha = users[7]
    const vikram = users[8]
    const anjali = users[9]

    console.log('📅 Creating attendance records...')

    const attendanceRecords = []
    const allEmployees = [
      sneha, amit, kavya, rohan, 
      nisha, vikram, anjali,
      manager1, manager2
    ]

    for (const emp of allEmployees) {
      for (let i = 60; i >= 1; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        
        if (date.getDay() === 0 || date.getDay() === 6) 
          continue

        let statusRoll = Math.random()
        let status, checkIn, checkOut, workHours

        if ([sneha, rohan, amit].includes(emp)) {
          status = statusRoll > 0.95 ? 'absent' 
            : statusRoll > 0.88 ? 'late' : 'present'
        } else if ([nisha, vikram].includes(emp)) {
          status = statusRoll > 0.80 ? 'absent'
            : statusRoll > 0.70 ? 'late' : 'present'
        } else {
          status = statusRoll > 0.90 ? 'absent'
            : statusRoll > 0.82 ? 'late' : 'present'
        }

        if (status === 'present') {
          checkIn = '09:00'
          checkOut = '18:00'
          workHours = 9
        } else if (status === 'late') {
          checkIn = '10:' + (Math.floor(Math.random()*4)*15)
            .toString().padStart(2,'0')
          checkOut = '19:00'
          workHours = 8
        } else {
          checkIn = null
          checkOut = null
          workHours = 0
        }

        attendanceRecords.push({
          employeeId: emp._id,
          date,
          status,
          checkIn,
          checkOut,
          workHours
        })
      }
    }
    await Attendance.insertMany(attendanceRecords)

    console.log('📊 Creating performance records...')

    const performanceData = [
      { emp: sneha, scores: [78,82,85,88,91,94], 
        goals: [[8,10],[9,10],[9,10],[10,10],[10,10],[10,10]] },
      { emp: amit, scores: [65,68,72,75,78,82],
        goals: [[7,10],[7,10],[8,10],[8,10],[8,10],[9,10]] },
      { emp: kavya, scores: [75,73,77,76,80,79],
        goals: [[8,10],[7,10],[8,10],[8,10],[8,10],[8,10]] },
      { emp: rohan, scores: [85,87,88,90,92,95],
        goals: [[9,10],[9,10],[10,10],[10,10],[10,10],[10,10]] },
      { emp: nisha, scores: [60,58,62,65,63,67],
        goals: [[6,10],[6,10],[7,10],[7,10],[6,10],[7,10]] },
      { emp: vikram, scores: [70,72,69,74,76,78],
        goals: [[7,10],[7,10],[7,10],[8,10],[8,10],[8,10]] },
      { emp: anjali, scores: [76,78,80,82,81,84],
        goals: [[8,10],[8,10],[8,10],[9,10],[8,10],[9,10]] },
    ]

    const months = [
      { month: 11, year: 2024 },
      { month: 12, year: 2024 },
      { month: 1, year: 2025 },
      { month: 2, year: 2025 },
      { month: 3, year: 2025 },
      { month: 4, year: 2025 },
    ]

    const performanceRecords = []
    for (const pd of performanceData) {
      for (let i = 0; i < 6; i++) {
        const score = pd.scores[i]
        performanceRecords.push({
          employeeId: pd.emp._id,
          month: months[i].month,
          year: months[i].year,
          kpiScore: score,
          goalsCompleted: pd.goals[i][0],
          totalGoals: pd.goals[i][1],
          rating: score >= 90 ? 5 
            : score >= 80 ? 4 
            : score >= 70 ? 3 
            : score >= 60 ? 2 : 1,
          managerNote: score >= 90 
            ? 'Exceptional performance this month!'
            : score >= 80 
            ? 'Great work, keep it up!'
            : score >= 70 
            ? 'Good performance, room for improvement'
            : 'Needs to focus on key deliverables',
          reviewedBy: manager1._id,
          productivity: score + Math.floor(Math.random()*5)
        })
      }
    }
    await Performance.insertMany(performanceRecords)

    console.log('🏆 Creating reward records...')

    const rewardRecords = [
      { employeeId: sneha._id, type: 'points', amount: 500,
        description: 'Delivered project 2 days ahead of schedule',
        awardedBy: manager1._id, category: 'performance',
        awardedAt: new Date('2025-02-10') },
      { employeeId: sneha._id, type: 'points', amount: 300,
        description: 'Perfect attendance February',
        awardedBy: manager1._id, category: 'attendance',
        awardedAt: new Date('2025-03-01') },
      { employeeId: sneha._id, type: 'bonus', amount: 5000,
        description: 'Q1 performance bonus',
        awardedBy: admin._id, category: 'performance',
        awardedAt: new Date('2025-04-01') },
      { employeeId: sneha._id, type: 'badge',
        description: 'Awarded Top Performer badge',
        awardedBy: manager1._id, category: 'performance',
        awardedAt: new Date('2025-02-01') },

      { employeeId: rohan._id, type: 'points', amount: 600,
        description: 'Exceeded sales target by 40%',
        awardedBy: manager2._id, category: 'performance',
        awardedAt: new Date('2025-02-15') },
      { employeeId: rohan._id, type: 'points', amount: 400,
        description: 'Best customer satisfaction score',
        awardedBy: manager2._id, category: 'performance',
        awardedAt: new Date('2025-03-10') },
      { employeeId: rohan._id, type: 'bonus', amount: 8000,
        description: 'Top Sales Employee Q1',
        awardedBy: admin._id, category: 'performance',
        awardedAt: new Date('2025-04-01') },

      { employeeId: amit._id, type: 'points', amount: 350,
        description: 'Fixed critical production bug',
        awardedBy: manager1._id, category: 'innovation',
        awardedAt: new Date('2025-02-20') },
      { employeeId: amit._id, type: 'points', amount: 200,
        description: 'Great teamwork on sprint delivery',
        awardedBy: manager1._id, category: 'teamwork',
        awardedAt: new Date('2025-03-15') },

      { employeeId: kavya._id, type: 'points', amount: 300,
        description: 'Viral marketing campaign',
        awardedBy: manager1._id, category: 'innovation',
        awardedAt: new Date('2025-03-01') },
      { employeeId: kavya._id, type: 'points', amount: 250,
        description: 'Consistent quality work',
        awardedBy: manager1._id, category: 'performance',
        awardedAt: new Date('2025-04-01') },

      { employeeId: anjali._id, type: 'points', amount: 280,
        description: 'Streamlined operations process',
        awardedBy: admin._id, category: 'innovation',
        awardedAt: new Date('2025-03-20') },

      { employeeId: vikram._id, type: 'points', amount: 220,
        description: 'Accurate quarterly reporting',
        awardedBy: admin._id, category: 'performance',
        awardedAt: new Date('2025-03-25') },

      { employeeId: nisha._id, type: 'points', amount: 180,
        description: 'Successfully onboarded 3 new hires',
        awardedBy: admin._id, category: 'teamwork',
        awardedAt: new Date('2025-04-05') },

      { employeeId: manager1._id, type: 'points', amount: 500,
        description: 'Engineering team delivered on time',
        awardedBy: admin._id, category: 'performance',
        awardedAt: new Date('2025-04-01') },
      { employeeId: manager2._id, type: 'points', amount: 450,
        description: 'Sales team exceeded Q1 targets',
        awardedBy: admin._id, category: 'performance',
        awardedAt: new Date('2025-04-01') },
    ]
    await Reward.insertMany(rewardRecords)

    console.log('💬 Creating feedback records...')

    const feedbackRecords = [
      { fromEmployee: amit._id, toEmployee: sneha._id,
        message: 'Sneha is an incredible team player. She always helps when I am stuck and delivers quality code every time. A true asset to the team!',
        rating: 5, type: 'peer', isAnonymous: false },
      { fromEmployee: manager1._id, toEmployee: sneha._id,
        message: 'Sneha consistently exceeds expectations. Her attention to detail and proactive approach make her one of our best engineers. Highly recommend for the senior role.',
        rating: 5, type: 'manager', isAnonymous: false },
      { fromEmployee: kavya._id, toEmployee: sneha._id,
        message: 'Always professional and helpful. Great to work with on cross-team projects.',
        rating: 4, type: 'peer', isAnonymous: false },

      { fromEmployee: manager2._id, toEmployee: rohan._id,
        message: 'Rohan is our star salesperson. He brings energy, creativity and results every single month. Proud to have him on the team.',
        rating: 5, type: 'manager', isAnonymous: false },
      { fromEmployee: nisha._id, toEmployee: rohan._id,
        message: 'Rohan is great at what he does and always motivates the team. Very collaborative.',
        rating: 4, type: 'peer', isAnonymous: false },

      { fromEmployee: sneha._id, toEmployee: amit._id,
        message: 'Amit has improved so much this quarter. His debugging skills are top notch and he is always willing to learn.',
        rating: 4, type: 'peer', isAnonymous: false },
      { fromEmployee: manager1._id, toEmployee: amit._id,
        message: 'Good consistent performance. Would love to see Amit take on more leadership in sprint planning.',
        rating: 4, type: 'manager', isAnonymous: false },

      { fromEmployee: rohan._id, toEmployee: kavya._id,
        message: 'The marketing campaigns Kavya runs are always creative and on-brand. Great to collaborate with.',
        rating: 4, type: 'peer', isAnonymous: false },
      { fromEmployee: sneha._id, toEmployee: kavya._id,
        message: 'Very creative and always brings fresh ideas to the table.',
        rating: 5, type: 'peer', isAnonymous: true },

      { fromEmployee: manager1._id, toEmployee: nisha._id,
        message: 'Nisha does a great job with HR processes. Would encourage her to be more confident in team meetings.',
        rating: 3, type: 'manager', isAnonymous: false },

      { fromEmployee: admin._id, toEmployee: anjali._id,
        message: 'Anjali runs operations smoothly. The new process she introduced saved us 3 hours per week.',
        rating: 5, type: 'manager', isAnonymous: false },

      { fromEmployee: admin._id, toEmployee: vikram._id,
        message: 'Vikram is reliable and thorough with financial reporting. Keep up the great work.',
        rating: 4, type: 'manager', isAnonymous: false },
    ]
    await Feedback.insertMany(feedbackRecords)

    console.log('')
    console.log('✅ ================================')
    console.log('✅  DATABASE SEEDED SUCCESSFULLY!')
    console.log('✅ ================================')
    console.log('')
    console.log('🔑 LOGIN CREDENTIALS:')
    console.log('================================')
    console.log('👑 ADMIN:')
    console.log('   Email: admin@rewardx.com')
    console.log('   Pass:  password123')
    console.log('')
    console.log('👔 MANAGER 1 (Engineering):')
    console.log('   Email: manager@rewardx.com')
    console.log('   Pass:  password123')
    console.log('')
    console.log('👔 MANAGER 2 (Sales):')
    console.log('   Email: manager2@rewardx.com')
    console.log('   Pass:  password123')
    console.log('')
    console.log('👤 EMPLOYEES:')
    console.log('   sneha@rewardx.com    | password123 | 3200pts')
    console.log('   rohan@rewardx.com    | password123 | 3500pts')
    console.log('   amit@rewardx.com     | password123 | 2800pts')
    console.log('   kavya@rewardx.com    | password123 | 2600pts')
    console.log('   anjali@rewardx.com   | password123 | 2400pts')
    console.log('   vikram@rewardx.com   | password123 | 2100pts')
    console.log('   nisha@rewardx.com    | password123 | 1900pts')
    console.log('')
    console.log('📊 DATA SUMMARY:')
    console.log('   👥 10 Users (1 admin, 2 managers, 7 employees)')
    console.log('   🏅 10 Badges (bronze to platinum)')
    console.log('   📅 ~420 Attendance records (60 days)')
    console.log('   📊 42 Performance reviews (6 months)')
    console.log('   🏆 17 Reward records')
    console.log('   💬 12 Feedback entries')
    console.log('================================')

    process.exit(0)

  } catch (err) {
    console.error('❌ Seeder failed:', err)
    process.exit(1)
  }
}

seedAll()
