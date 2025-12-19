import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI_LOCAL || process.env.MONGO_URI || 'mongodb://localhost:27017/mockdata');

    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, required: true },
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Expert Schema (simplified version matching your model)
const expertSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    profileImage: String,
    personalInformation: {
        userName: String,
        mobile: String,
        gender: String,
        dob: Date,
        country: String,
        state: String,
        city: String,
        category: String
    },
    education: [{
        degree: String,
        institution: String,
        field: String,
        start: Number,
        end: Number
    }],
    professionalDetails: {
        title: String,
        company: String,
        totalExperience: Number,
        industry: String,
        previous: []
    },
    skillsAndExpertise: {
        domains: [String],
        languages: [String],
        mode: String,
        tools: [String]
    },
    availability: {
        sessionDuration: Number,
        maxPerDay: Number,
        weekly: mongoose.Schema.Types.Mixed,
        breakDates: []
    },
    verification: {
        companyId: {
            url: String,
            name: String
        },
        aadhar: {
            url: String,
            name: String
        },
        linkedin: String
    },
    pricing: {
        hourlyRate: Number,
        currency: String,
        customPricing: Boolean
    },
    metrics: {
        totalSessions: Number,
        completedSessions: Number,
        cancelledSessions: Number,
        avgRating: Number,
        totalReviews: Number,
        avgResponseTime: Number
    },
    status: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const ExpertDetails = mongoose.model('ExpertDetails', expertSchema);

// Dummy Data Generator
const generateDummyExperts = () => {
    const categories = [
        {
            id: 'IT',
            experts: [
                { name: 'Rajesh Kumar', title: 'Senior Full Stack Developer', company: 'TCS', domains: ['web-development', 'cloud-computing'], tools: ['react', 'nodejs', 'aws'], industry: 'Technology' },
                { name: 'Priya Sharma', title: 'DevOps Engineer', company: 'Infosys', domains: ['devops', 'automation'], tools: ['kubernetes', 'docker', 'jenkins'], industry: 'Technology' },
                { name: 'Amit Patel', title: 'Backend Developer', company: 'Wipro', domains: ['backend-development', 'microservices'], tools: ['java', 'spring-boot', 'kafka'], industry: 'Technology' },
                { name: 'Sneha Reddy', title: 'Frontend Developer', company: 'Cognizant', domains: ['frontend-development', 'ui-ux'], tools: ['angular', 'typescript', 'sass'], industry: 'Technology' }
            ]
        },
        {
            id: 'HR',
            experts: [
                { name: 'Kavita Menon', title: 'HR Business Partner', company: 'Google', domains: ['talent-acquisition', 'employee-relations'], tools: ['workday', 'greenhouse', 'linkedin-recruiter'], industry: 'Human Resources' },
                { name: 'Arjun Singh', title: 'Talent Acquisition Lead', company: 'Microsoft', domains: ['recruitment', 'talent-management'], tools: ['applicant-tracking-system', 'jobvite'], industry: 'Human Resources' },
                { name: 'Deepa Iyer', title: 'HR Manager', company: 'Amazon', domains: ['performance-management', 'compensation'], tools: ['sap-successfactors', 'bamboohr'], industry: 'Human Resources' },
                { name: 'Vikram Desai', title: 'Recruitment Specialist', company: 'Accenture', domains: ['campus-hiring', 'lateral-hiring'], tools: ['naukri', 'monster', 'indeed'], industry: 'Human Resources' }
            ]
        },
        {
            id: 'Business',
            experts: [
                { name: 'Rahul Mehta', title: 'Business Analyst', company: 'Deloitte', domains: ['business-analysis', 'requirements-gathering'], tools: ['jira', 'confluence', 'tableau'], industry: 'Consulting' },
                { name: 'Anjali Gupta', title: 'Product Manager', company: 'Flipkart', domains: ['product-strategy', 'roadmap-planning'], tools: ['asana', 'productboard', 'mixpanel'], industry: 'E-commerce' },
                { name: 'Sanjay Nair', title: 'Strategy Consultant', company: 'McKinsey', domains: ['strategic-planning', 'market-research'], tools: ['powerpoint', 'excel', 'tableau'], industry: 'Consulting' },
                { name: 'Meera Krishnan', title: 'Operations Manager', company: 'Swiggy', domains: ['operations', 'process-improvement'], tools: ['lean-six-sigma', 'erp'], industry: 'Food Delivery' }
            ]
        },
        {
            id: 'Design',
            experts: [
                { name: 'Aditya Rao', title: 'UI/UX Designer', company: 'Adobe', domains: ['ui-design', 'ux-research'], tools: ['figma', 'sketch', 'adobe-xd'], industry: 'Design' },
                { name: 'Pooja Joshi', title: 'Product Designer', company: 'Zomato', domains: ['product-design', 'user-research'], tools: ['figma', 'invision', 'miro'], industry: 'Food Tech' },
                { name: 'Karthik Bhat', title: 'Graphic Designer', company: 'Ogilvy', domains: ['graphic-design', 'branding'], tools: ['photoshop', 'illustrator', 'indesign'], industry: 'Advertising' },
                { name: 'Nisha Kapoor', title: 'UX Researcher', company: 'Paytm', domains: ['user-research', 'usability-testing'], tools: ['optimal-workshop', 'usertesting', 'hotjar'], industry: 'Fintech' }
            ]
        },
        {
            id: 'Marketing',
            experts: [
                { name: 'Rohan Verma', title: 'Digital Marketing Manager', company: 'Unilever', domains: ['digital-marketing', 'seo'], tools: ['google-analytics', 'semrush', 'hubspot'], industry: 'FMCG' },
                { name: 'Simran Kaur', title: 'Content Marketing Lead', company: 'Byju\'s', domains: ['content-strategy', 'copywriting'], tools: ['wordpress', 'grammarly', 'canva'], industry: 'EdTech' },
                { name: 'Manish Agarwal', title: 'Social Media Manager', company: 'Myntra', domains: ['social-media-marketing', 'influencer-marketing'], tools: ['hootsuite', 'buffer', 'sprout-social'], industry: 'Fashion' },
                { name: 'Divya Pillai', title: 'Brand Manager', company: 'Coca-Cola', domains: ['brand-management', 'marketing-strategy'], tools: ['market-research-tools', 'crm'], industry: 'Beverages' }
            ]
        },
        {
            id: 'Finance',
            experts: [
                { name: 'Suresh Babu', title: 'Financial Analyst', company: 'ICICI Bank', domains: ['financial-analysis', 'investment-banking'], tools: ['excel', 'bloomberg', 'quickbooks'], industry: 'Banking' },
                { name: 'Lakshmi Narayan', title: 'Investment Banker', company: 'Goldman Sachs', domains: ['mergers-acquisitions', 'equity-research'], tools: ['capital-iq', 'factset', 'refinitiv'], industry: 'Investment Banking' },
                { name: 'Harish Chand', title: 'Chartered Accountant', company: 'EY', domains: ['auditing', 'taxation'], tools: ['tally', 'sap-fico', 'zoho-books'], industry: 'Accounting' },
                { name: 'Ritu Malhotra', title: 'Risk Analyst', company: 'HDFC Bank', domains: ['risk-management', 'compliance'], tools: ['sas', 'r', 'python'], industry: 'Banking' }
            ]
        },
        {
            id: 'AI',
            experts: [
                { name: 'Varun Khanna', title: 'Machine Learning Engineer', company: 'OpenAI', domains: ['machine-learning', 'deep-learning'], tools: ['tensorflow', 'pytorch', 'scikit-learn'], industry: 'Artificial Intelligence' },
                { name: 'Ishita Das', title: 'Data Scientist', company: 'Netflix', domains: ['data-science', 'predictive-analytics'], tools: ['python', 'r', 'sql'], industry: 'Entertainment' },
                { name: 'Nikhil Yadav', title: 'AI Research Scientist', company: 'Meta', domains: ['natural-language-processing', 'computer-vision'], tools: ['transformers', 'opencv', 'keras'], industry: 'Social Media' },
                { name: 'Tanvi Shah', title: 'MLOps Engineer', company: 'Uber', domains: ['mlops', 'model-deployment'], tools: ['mlflow', 'kubeflow', 'airflow'], industry: 'Transportation' }
            ]
        }
    ];

    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'];
    const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Maharashtra', 'West Bengal', 'Gujarat'];
    const genders = ['Male', 'Female'];
    const modes = ['Online', 'Offline', 'Hybrid'];

    const dummyData = [];

    categories.forEach((category, catIndex) => {
        category.experts.forEach((expert, expIndex) => {
            const email = `${expert.name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
            const mobile = `${9000000000 + (catIndex * 1000) + (expIndex * 100)}`;
            const cityIndex = (catIndex * 4 + expIndex) % cities.length;
            const experience = 2 + expIndex + catIndex;
            const age = 25 + experience;
            const dob = new Date(new Date().getFullYear() - age, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

            dummyData.push({
                user: {
                    email,
                    password: 'password123', // Will be hashed
                    userType: 'expert',
                    name: expert.name.split(' ')[0].toLowerCase()
                },
                expert: {
                    profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=random&size=200`,
                    personalInformation: {
                        userName: expert.name,
                        mobile,
                        gender: genders[expIndex % 2],
                        dob,
                        country: 'India',
                        state: states[cityIndex],
                        city: cities[cityIndex],
                        category: category.id
                    },
                    education: [{
                        degree: expIndex % 2 === 0 ? 'B.Tech' : 'MBA',
                        institution: ['IIT Delhi', 'IIM Bangalore', 'Anna University', 'Delhi University'][expIndex],
                        field: expert.industry,
                        start: 2010 + expIndex,
                        end: 2014 + expIndex
                    }],
                    professionalDetails: {
                        title: expert.title,
                        company: expert.company,
                        totalExperience: experience,
                        industry: expert.industry,
                        previous: []
                    },
                    skillsAndExpertise: {
                        domains: expert.domains,
                        languages: ['english', 'hindi'],
                        mode: modes[expIndex % 3],
                        tools: expert.tools
                    },
                    availability: {
                        sessionDuration: 30,
                        maxPerDay: 3,
                        weekly: {
                            mon: [{ from: '09:00', to: '17:00' }],
                            tue: [{ from: '09:00', to: '17:00' }],
                            wed: [{ from: '09:00', to: '17:00' }],
                            thu: [{ from: '09:00', to: '17:00' }],
                            fri: [{ from: '09:00', to: '17:00' }]
                        },
                        breakDates: []
                    },
                    verification: {
                        companyId: {
                            url: 'http://localhost:3000/uploads/verification/dummy-company-id.pdf',
                            name: 'company-id.pdf'
                        },
                        aadhar: {
                            url: 'http://localhost:3000/uploads/verification/dummy-aadhar.pdf',
                            name: 'aadhar.pdf'
                        },
                        linkedin: `https://linkedin.com/in/${expert.name.toLowerCase().replace(/\s+/g, '-')}`
                    },
                    pricing: {
                        hourlyRate: 500 + (experience * 100),
                        currency: 'INR',
                        customPricing: false
                    },
                    metrics: {
                        totalSessions: Math.floor(Math.random() * 50),
                        completedSessions: Math.floor(Math.random() * 40),
                        cancelledSessions: Math.floor(Math.random() * 5),
                        avgRating: 4 + Math.random(),
                        totalReviews: Math.floor(Math.random() * 30),
                        avgResponseTime: Math.floor(Math.random() * 24)
                    },
                    status: 'Active'
                }
            });
        });
    });

    return dummyData;
};

// Seed Database
const seedDatabase = async () => {
    try {
        await connectDB();


        // Clear existing expert data
        const expertUsers = await User.find({ userType: 'expert' });
        const expertUserIds = expertUsers.map(u => u._id);
        await ExpertDetails.deleteMany({ userId: { $in: expertUserIds } });
        await User.deleteMany({ userType: 'expert' });



        const dummyData = generateDummyExperts();



        for (const data of dummyData) {
            // Hash password
            const hashedPassword = await bcrypt.hash(data.user.password, 10);

            // Create user
            const user = new User({
                ...data.user,
                password: hashedPassword
            });
            await user.save();

            // Create expert profile
            const expert = new ExpertDetails({
                ...data.expert,
                userId: user._id
            });
            await expert.save();


        }



        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run seeder
seedDatabase();
