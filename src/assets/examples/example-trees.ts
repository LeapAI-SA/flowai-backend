export const example1 = `
Description: "This section is for an informtive chatbot for an ECommerce business.
FlowTree:  {
    name: "initial_greeting",
    type: IntentType.TEXT,
    description: "Welcome to Khazaney! We offer information on Men's Wear, Female Wear, and Children's Wardrobe. How can we assist you today?",
    child: {
        name: "service_type",
        type: IntentType.SELECTION,
        description: "Please select the type of information you want.",
        schema: z.enum(["Men's Wear", 'Female Wear', "Children's Wardrobe", 'Portfolio', 'FAQ']),
        children: [
            {
                name: "Men's Wear",
                type: IntentType.INTERMEDIATE,
                description: "Information about our Men's Wear offerings.",
                child: {
                    name: "mens_details",
                    type: IntentType.TEXT,
                    description: "Our Men's Wear includes Shalwar Kameez made from exotic cotton imported from England and is wrinkle-free.",
                }
            },
            {
                name: "Female Wear",
                type: IntentType.INTERMEDIATE,
                description: "Information about our Female Wear offerings.",
                child: {
                    name: "female_details",
                    type: IntentType.TEXT,
                    description: "Our Female Wear includes hand-stitched Lehengas embroidered with diamonds and made of silk.",
                }
            },
            {
                name: "Children's Wardrobe",
                type: IntentType.INTERMEDIATE,
                description: "Information about our Children's Wardrobe offerings.",
                child: {
                    name: "children_details",
                    type: IntentType.TEXT,
                    description: "Our Children's Wardrobe features clothes made from lightweight cotton, very light on the body, and breezy.",
                }
            },
            {
                name: "Portfolio",
                type: IntentType.SELECTION,
                description: "Highlighting the achievements of our products. Please select a category.",
                schema: z.enum(["Men's Wear Achievements", "Female Wear Achievements"]),
                children: [
                    {
                        name: "Men's Wear Achievements",
                        type: IntentType.TEXT,
                        description: "Our Shalwar Kameez won an award at the Paris Film Festival, featuring a silky white color with light embroidery.",
                    },
                    {
                        name: "Female Wear Achievements",
                        type: IntentType.TEXT,
                        description: "Our Lehengas were worn at the Paris Film Festival by famous model Kylie Jenner, stitched by a team of 30 dedicated tailors.",
                    }
                ]
            },
            {
                name: "FAQ",
                type: IntentType.SELECTION,
                description: "Frequently Asked Questions. Please select a question.",
                schema: z.enum(['Where is the office?', 'What is the phone number?', 'What are the delivery times?']),
                children: [
                    {
                        name: "Where is the office?",
                        type: IntentType.TEXT,
                        description: "The office is located in Lahore.",
                    },
                    {
                        name: "What is the phone number?",
                        type: IntentType.TEXT,
                        description: "The phone number is 92333309.",
     
                    },
                    {
                        name: "What are the delivery times?",
                        type: IntentType.TEXT,
                        description: "The delivery times are 3-4 days.",
                       
                    }
                ]
            }
        ]
    }
};
`

export const example2 = `
Description: "This section is for an informAtive chatbot for a software based company providing services.
FlowTree:  {
    name: "initial_greeting",
    type: IntentType.TEXT,
    description: "Welcome to Leap Company! We offer services in web development, mobile development, and desktop development. How can we assist you today?",
    child: {
        name: "service_type",
        type: IntentType.SELECTION,
        description: "Please select the type of information you want.",
        schema: z.enum(['Web Development', 'Mobile Development', 'Desktop Development'
        ]),
        children: [
            {
                name: "Web Development",
                type: IntentType.INTERMEDIATE,
                description: "Information about our web development services.",
                child: {
                    name: "web_projects",
                    type: IntentType.SELECTION,
                    description: "Our prominent web development project is called BAB. Would you like more details?",
                    schema: z.enum(['Yes', 'No'
                    ]),
                    children: [
                        {
                            name: "Yes",
                            type: IntentType.TEXT,
                            description: "The BAB project is a major initiative at Leap Company, with a team of 50 developers. It is deployed on Microsoft Azure, utilizing FastAPI for the backend and React for the frontend."
                        },
                        {
                            name: "No",
                            type: IntentType.TEXT,
                            description: "Alright, let us know if you need any more information."
                        }
                    ]
                }
            },
            {
                name: "Mobile Development",
                type: IntentType.INTERMEDIATE,
                description: "Information about our mobile development services.",
                child: {
                    name: "mobile_projects",
                    type: IntentType.SELECTION,
                    description: "One of our key projects is Avengers Ultron. Would you like more details?",
                    schema: z.enum(['Yes', 'No'
                    ]),
                    children: [
                        {
                            name: "Yes",
                            type: IntentType.TEXT,
                            description: "The Avengers Ultron project is a fully functional app developed using Flutter. Our client, John, provided excellent feedback on our work."
                        },
                        {
                            name: "No",
                            type: IntentType.TEXT,
                            description: "Alright, let us know if you need any more information."
                        }
                    ]
                }
            },
            {
                name: "Desktop Development",
                type: IntentType.INTERMEDIATE,
                description: "Information about our desktop development services.",
                child: {
                    name: "desktop_technologies",
                    type: IntentType.TEXT,
                    description: "We utilize C# to create cross-platform applications for end users."
                }
            }
        ]
    }
};
`
export const example3 = `
Description: "This section is for an informtive chatbot for a software based company providing services and subservices with diverse portfolio.
FlowTree: {
    name: "initial_greeting",
    type: IntentType.TEXT,
    description: "Welcome to Leap AI! We offer services in Web Development and AI Development. How can we assist you today?",
    child: {
        name: "service_type",
        type: IntentType.SELECTION,
        description: "Please select the type of information you want.",
        schema: z.enum(['Web Development', 'AI Development', 'Portfolio'
        ]),
        children: [
            {
                name: "Web Development",
                type: IntentType.INTERMEDIATE,
                description: "Information about our Web Development services.",
                child: {
                    name: "web_development_type",
                    type: IntentType.SELECTION,
                    description: "We specialize in MERN and NEST development. Please select a type.",
                    schema: z.enum(['MERN Development', 'NEST Development'
                    ]),
                    children: [
                        {
                            name: "MERN Development",
                            type: IntentType.TEXT,
                            description: "Our MERN development is handled by a team of 15 experienced professionals who excel in creating interactive designs and integrating them with the backend."
                        },
                        {
                            name: "NEST Development",
                            type: IntentType.TEXT,
                            description: "Our NEST JS development is done by a team of 20 individuals who specialize in Node JS and related frameworks, focusing on creating server-side applications that connect to frontend designs."
                        }
                    ]
                }
            },
            {
                name: "AI Development",
                type: IntentType.INTERMEDIATE,
                description: "Information about our AI Development services.",
                child: {
                    name: "ai_development_type",
                    type: IntentType.SELECTION,
                    description: "We offer Generative AI and Model Creation services. Please select a type.",
                    schema: z.enum(['Generative AI', 'Model Creation'
                    ]),
                    children: [
                        {
                            name: "Generative AI",
                            type: IntentType.TEXT,
                            description: "Generative AI utilizes existing LLMs and incorporates them into applications for effective solutions."
                        },
                        {
                            name: "Model Creation",
                            type: IntentType.TEXT,
                            description: "In Model Creation, we possess the capability to build new models from scratch tailored to specific use cases."
                        }
                    ]
                }
            },
            {
                name: "Portfolio",
                type: IntentType.SELECTION,
                description: "Highlighting our key projects. Please select a project.",
                schema: z.enum(['Flow AI', 'Resume Ranker'
                ]),
                children: [
                    {
                        name: "Flow AI",
                        type: IntentType.TEXT,
                        description: "Flow AI employs Generative AI techniques to create chatbots on the go."
                    },
                    {
                        name: "Resume Ranker",
                        type: IntentType.TEXT,
                        description: "Resume Ranker integrates with Llama 3 to provide technical recruiters access to scored resumes."
                    }
                ]
            }
        ]
    }
};
`