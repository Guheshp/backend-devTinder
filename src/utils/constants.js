const memberAmount = {
    silver: 200,
    gold: 400
};


const skillList = [
    // ---------- Frontend ----------
    { id: 'html', name: 'HTML' },
    { id: 'css', name: 'CSS' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'react', name: 'React' },
    { id: 'next_js', name: 'Next.js' },
    { id: 'redux', name: 'Redux' },
    { id: 'tailwind_css', name: 'Tailwind CSS' },
    { id: 'material_ui', name: 'Material UI' },

    // ---------- Backend ----------
    { id: 'node_js', name: 'Node.js' },
    { id: 'express_js', name: 'Express.js' },
    { id: 'nestjs', name: 'NestJS' },
    { id: 'rest_api', name: 'REST APIs' },
    { id: 'graphql', name: 'GraphQL' },
    { id: 'jwt_auth', name: 'JWT Authentication' },

    // ---------- Databases ----------
    { id: 'mongodb', name: 'MongoDB' },
    { id: 'postgresql', name: 'PostgreSQL' },
    { id: 'mysql', name: 'MySQL' },
    { id: 'redis', name: 'Redis' },

    // ---------- ORMs / Tools ----------
    { id: 'sequelize', name: 'Sequelize' },
    { id: 'prisma', name: 'Prisma' },
    { id: 'mongoose', name: 'Mongoose' },

    // ---------- DevOps ----------
    { id: 'git', name: 'Git' },
    { id: 'github', name: 'GitHub' },
    { id: 'docker', name: 'Docker' },
    { id: 'docker_compose', name: 'Docker Compose' },
    { id: 'nginx', name: 'Nginx' },
    { id: 'ci_cd', name: 'CI/CD' },
    { id: 'aws', name: 'AWS' },
    { id: 'linux', name: 'Linux' },
    { id: 'pm2', name: 'PM2' },

    // ---------- Testing ----------
    { id: 'jest', name: 'Jest' },
    { id: 'react_testing_library', name: 'React Testing Library' },

    // ---------- Architecture ----------
    { id: 'microservices', name: 'Microservices' },
    { id: 'system_design', name: 'System Design' },

    // ---------- Others ----------
    { id: 'web_security', name: 'Web Security' },
    { id: 'performance_optimization', name: 'Performance Optimization' }
]

module.exports = {
    memberAmount,
    skillList
};