import { FlowTree, IntentType } from 'src/flow-ai/flow-ai.types';
import z from 'zod';

export const ProductSystem:FlowTree = {
  name: "product_category",
  type: IntentType.SELECTION,
  description: "Please select a product category you are interested in.",
  schema: z.enum(['Electronics', 'Apparel', 'Home Appliances']),
  child: {
    name: "product_detail",
    type: IntentType.TEXT,
    description: "What specific product are you looking for?",
    schema: z.string(),
    child: {
      name: "purchase_confirmation",
      type: IntentType.TEXT,
      description: "Would you like to add this to your cart?",
      schema: z.enum(['Yes', 'No']),
      child: {
        name: "end",
        type: IntentType.TEXT,
        description: "Thank you for shopping with us!",
      }
    }
  }
};

export const VehicleSystem: FlowTree = {
  name: "initial_greeting",
  type: IntentType.TEXT,
  description: "Welcome to AutoDrive Dealership! Are you looking to buy a car, book a service, or get more information on our models?",
  child: {
      name: "service_type",
      type: IntentType.SELECTION,
      description: "Please select your interest: Buy a Car, Book a Service, Learn About Cars.",
      schema: z.enum(['Buy a Car', 'Book a Service', 'Learn About Cars']),
      children: [
          {
              name: "Buy a Car",
              type: IntentType.SELECTION,
              description: "What type of car are you interested in? New, Used, or Leasing options.",
              schema: z.enum(['New', 'Used', 'Leasing']),
              children: [
                  {
                      name: "New",
                      type: IntentType.TEXT,
                      description: "Which model are you interested in? Please specify.",
                      schema: z.string(),
                      child: {
                          name: "Schedule Test Drive",
                          type: IntentType.TEXT,
                          description: "Would you like to schedule a test drive? Yes or No.",
                          schema: z.enum(['Yes', 'No']),
                          child: {
                              name: "Test Drive Date",
                              type: IntentType.TEXT,
                              description: "Please provide a preferred date for your test drive in MM/DD/YYYY format.",
                              schema: z.string(),
                              child: {
                                  name: "End New Car",
                                  type: IntentType.TEXT,
                                  description: "Thank you! We'll confirm your test drive date soon."
                              }
                          }
                      }
                  },
                  {
                      name: "Used",
                      type: IntentType.TEXT,
                      description: "Which one interests you?",
                      schema: z.string(),
                      child: {
                          name: "Finance Options",
                          type: IntentType.TEXT,
                          description: "Would you like to discuss financing options? Yes or No.",
                          schema: z.enum(['Yes', 'No']),
                          child: {
                              name: "End Used Car",
                              type: IntentType.TEXT,
                              description: "Thank you! Our finance team will contact you soon."
                          }
                      }
                  }
              ]
          },
          {
              name: "Book a Service",
              type: IntentType.TEXT,
              description: "What type of service do you need? Maintenance, Repair, or Inspection.",
              schema: z.enum(['Maintenance', 'Repair', 'Inspection']),
              child: {
                  name: "Service Date",
                  type: IntentType.TEXT,
                  description: "Please provide a date for your service in MM/DD/YYYY format.",
                  schema: z.string(),
                  child: {
                      name: "End Book Service",
                      type: IntentType.TEXT,
                      description: "Thank you! Your service appointment is scheduled."
                  }
              }
          },
          {
              name: "Learn About Cars",
              type: IntentType.TEXT,
              description: "Which model would you like to learn more about? Please specify the model.",
              schema: z.string(),
              child: {
                  name: "Car Details",
                  type: IntentType.TEXT,
                  description: "Here are the details of the model. Would you like more information on another model?",
                  schema: z.enum(['Yes', 'No']),
                  child: {
                      name: "End Learn Cars",
                      type: IntentType.TEXT,
                      description: "Thank you for your interest! Feel free to ask more any time."
                  }
              }
          }
      ]
  }
};




//////////////////////////////////////////////////////////////////// SERVICE BASED TREES ///////////////////////////////////////////////////////////////




export const ServiceSystem:FlowTree = {
  name: "greet_user",
  type: IntentType.TEXT,
  description: "Greet the user.",
  child: {
      name: "service_selection",
      type: IntentType.SELECTION,
      description: "What service do you need? Lawn Mowing, Weed Control, or Lawn Treatment.",
      schema: z.enum(['Lawn Mowing', 'Weed Control', 'Lawn Treatment']),
      child: {
          name: "user_phone_number",
          type: IntentType.TEXT,
          description: "Please provide your phone number.",
          schema: z.string().regex(/^(?:\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}|\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})$/),
          child: {
              name: "user_address",
              type: IntentType.TEXT,
              description: "Please provide your address.",
              schema: z.string(),
              child: {
                  name: "schedule_date",
                  type: IntentType.TEXT,
                  description: "What date do you want to schedule a visit? Please provide the date in YYYY-MM-DD format.",
                  schema: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
                  child: {
                      name: "end",
                      type: IntentType.TEXT,
                      description: "Thank you! Your visit will be scheduled accordingly."
                  }
              }
          }
      }
  }
};

export const CleaningSystem:FlowTree = {
  name: "greeting",
  type: IntentType.TEXT,
  description: "Welcome to our House Cleaning Service Agency! How can we assist you today?",
  child: {
      name: "service_selection",
      type: IntentType.SELECTION,
      description: "Please select a service: Standard Cleaning, Deep Cleaning, or Move out Cleaning.",
      schema: z.enum(['Standard Cleaning', 'Deep Cleaning', 'Move out Cleaning']),
      child: {
          name: "frequency",
          type: IntentType.TEXT,
          description: "How many times a week do you require this service?",
          schema: z.string().regex(/^[0-7]$/),
          child: {
              name: "home_type",
              type: IntentType.TEXT,
              description: "What type of home do you have? (e.g., Apartment, House, Condo)",
              schema: z.string(),
              child: {
                  name: "number_of_rooms",
                  type: IntentType.TEXT,
                  description: "How many rooms need to be cleaned?",
                  schema: z.string(),
                  child: {
                      name: "address",
                      type: IntentType.TEXT,
                      description: "Please provide your home address.",
                      schema: z.string(),
                      child: {
                          name: "phone_number",
                          type: IntentType.TEXT,
                          description: "Please provide your phone number.",
                          schema: z.string(),
                          child: {
                              name: "schedule_date",
                              type: IntentType.TEXT,
                              description: "What date do you want to schedule a visit? Please provide the date in YYYY-MM-DD format.",
                              schema: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
                              child: {
                                  name: "special_instructions",
                                  type: IntentType.TEXT,
                                  description: "Any special instructions?",
                                  schema: z.string(),
                                  child: {
                                      name: "end",
                                      type: IntentType.TEXT,
                                      description: "Thank you! We have gathered all the necessary information. We will contact you soon to confirm your appointment."
                                  }
                              }
                          }
                      }
                  }
              }
          }
      }
  }
};


export const HotelManagementSystem: FlowTree = {
  name: "initial_greeting",
  type: IntentType.TEXT,
  description: "Welcome to LuxStay Hotel! Which package would you like to choose: Normal, Premium, or Luxury?",
  child: {
      name: "package_type",
      type: IntentType.SELECTION,
      description: "Please select your preferred package: Normal, Premium, Luxury.",
      schema: z.enum(['Normal', 'Premium', 'Luxury']),
      children: [
          {
              name: "Normal",
              type: IntentType.SELECTION,
              description: "Do you prefer: AC room or NOT AC room?",
              schema: z.enum(['AC', 'NOT AC']),
              child: {
                  name: "user_name",
                  type: IntentType.TEXT,
                  description: "Please enter your name.",
                  schema: z.string(),
                child: {
                        name: "end_normal",
                        type: IntentType.TEXT,
                        description: "Thank you! Your booking is complete."
                      }
                  }
          },
          {
              name: "Premium",
              type: IntentType.SELECTION,
              description: "Do you prefer: 1 Bed or 2 Bed?",
              schema: z.enum(['1 Bed', '2 Bed']),
              child: {
                  name: "user_name",
                  type: IntentType.TEXT,
                  description: "Please enter your full name.",
                  schema: z.string(),
                  child: {
                          name: "end_premium",
                          type: IntentType.TEXT,
                          description: "Thank you! Your booking is complete."
                      }
                  }
          },
          {
              name: "Luxury",
              type: IntentType.SELECTION,
              description: "Do you prefer: Pent House or Double Suite?",
              schema: z.enum(['Pent House', 'Double Suite']),
              child: {
                  name: "user_name",
                  type: IntentType.TEXT,
                  description: "Please enter your full name.",
                  schema: z.string(),
                  child: {
                          name: "end_luxury",
                          type: IntentType.TEXT,
                          description: "Thank you! Your booking is complete."
                      }        
              }
          }
      ]
  }
};

export const HomeManagementSystem: FlowTree = {
    name: "initial_greeting",
    type: IntentType.TEXT,
    description: "Welcome! We provide various household items including utilities, cutlery, and clothing. How can I assist you today?",
    child: {
        name: "service_type",
        type: IntentType.SELECTION,
        description: "Please select a service category: Utilities, Cutlery, or Clothing.",
        schema: z.enum(['Utilities', 'Cutlery', 'Clothing']),
        children: [
            {
                name: "Utilities",
                type: IntentType.SELECTION,
                description: "Please select an option: Rice, Wheat, or Lentils.",
                schema: z.enum(['Rice', 'Wheat', 'Lentils']),
                children: [
                    {
                        name: "Rice",
                        type: IntentType.TEXT,
                        description: "You've selected Rice. Please provide your username.",
                        schema: z.string(),
                        child: {
                            name: "phone_number",
                            type: IntentType.TEXT,
                            description: "Please provide your phone number.",
                            schema: z.string(),
                            child: {
                                    name: "end",
                                    type: IntentType.TEXT,
                                    description: "Thank you! Your request has been processed."
                                }
                        }
                    },
                    {
                        name: "Wheat",
                        type: IntentType.TEXT,
                        description: "You've selected Wheat. Please provide your username.",
                        schema: z.string(),
                        child: {
                            name: "phone_number",
                            type: IntentType.TEXT,
                            description: "Please provide your phone number.",
                            schema: z.string(),
                            child: {
                                    name: "end",
                                    type: IntentType.TEXT,
                                    description: "Thank you! Your request has been processed."
                                }
                        }
                    },
                    {
                        name: "Lentils",
                        type: IntentType.TEXT,
                        description: "You've selected Lentils. Please provide your username.",
                        schema: z.string(),
                        child: {
                            name: "phone_number",
                            type: IntentType.TEXT,
                            description: "Please provide your phone number.",
                            schema: z.string(),
                            child: {
                                    name: "end",
                                    type: IntentType.TEXT,
                                    description: "Thank you! Your request has been processed."
                                }
                            }
                    }
                ]
            },
            {
                name: "Cutlery",
                type: IntentType.SELECTION,
                description: "Please select an option: Kitchen Items or Guest Items.",
                schema: z.enum(['Kitchen Items', 'Guest Items']),
                children: [
                    {
                        name: "Kitchen Items",
                        type: IntentType.TEXT,
                        description: "You've selected Kitchen Items. Please provide your username.",
                        schema: z.string(),
                        child: {
                            name: "phone_number",
                            type: IntentType.TEXT,
                            description: "Please provide your phone number.",
                            schema: z.string(),
                            child: {
                                    name: "end",
                                    type: IntentType.TEXT,
                                    description: "Thank you! Your request has been processed."
                            }
                        }
                    },
                    {
                        name: "Guest Items",
                        type: IntentType.TEXT,
                        description: "You've selected Guest Items. Please provide your username.",
                        schema: z.string(),
                        child: {
                            name: "phone_number",
                            type: IntentType.TEXT,
                            description: "Please provide your phone number.",
                            schema: z.string(),
                            child: {
                                    name: "end",
                                    type: IntentType.TEXT,
                                    description: "Thank you! Your request for has been processed."
                                }
                        }
                    }
                ]
            },
            {
                name: "Clothing",
                type: IntentType.SELECTION,
                description: "Please select an option: Children, Men, or Female.",
                schema: z.enum(['Children', 'Men', 'Female']),
                children: [
                    {
                        name: "Children",
                        type: IntentType.TEXT,
                        description: "You've selected Children clothing. Please provide your username.",
                        schema: z.string(),
                        child: {
                            name: "phone_number",
                            type: IntentType.TEXT,
                            description: "Please provide your phone number.",
                            schema: z.string(),
                            child: {
                                    name: "end",
                                    type: IntentType.TEXT,
                                    description: "Thank you! Your request has been processed."
                            }
                        }
                    },
                    {
                        name: "Men",
                        type: IntentType.TEXT,
                        description: "You've selected Men's clothing. Please provide your username.",
                        schema: z.string(),
                        child: {
                            name: "phone_number",
                            type: IntentType.TEXT,
                            description: "Please provide your phone number.",
                            schema: z.string(),
                                child: {
                                    name: "end",
                                    type: IntentType.TEXT,
                                    description: "Thank you! Your request for has been processed."
                            }
                        }
                    },
                    {
                        name: "Female",
                        type: IntentType.TEXT,
                        description: "You've selected Female clothing. Please provide your username.",
                        schema: z.string(),
                        child: {
                            name: "phone_number",
                            type: IntentType.TEXT,
                            description: "Please provide your phone number.",
                            schema: z.string(),
                            child: {
                                    name: "end",
                                    type: IntentType.TEXT,
                                    description: "Thank you! Your request has been processed."
                                }
                        }
                    }
                ]
            }
        ]
    }
};


export const SportsManagementSystem: FlowTree = {
    name: "initial_greeting",
    type: IntentType.TEXT,
    description: "Welcome to the Sports Booking Chatbot! Let us know which sport you would like to play.",
    children: [
        {
            name: "sport_selection",
            type: IntentType.SELECTION,
            description: "Please choose a sport to play: Cricket, Football, or Padel.",
            schema: z.enum(['Cricket', 'Football', 'Padel']),
            children: [
                {
                    name: "Cricket",
                    type: IntentType.SELECTION,
                    description: "Would you like to book grounds for Cricket? Yes or No.",
                    schema: z.enum(['Yes', 'No']),
                    children: [
                        {
                            name: "Cricket_Ground_Selection",
                            type: IntentType.SELECTION,
                            description: "Choose your ground type: Single Court or Double Court.",
                            schema: z.enum(['Single Court', 'Double Court']),
                            children: [
                                {
                                    name: "booking_details",
                                    type: IntentType.TEXT,
                                    description: "Please provide your name for the booking.",
                                    schema: z.string(),
                                    child: {
                                        name: "booking_date",
                                        type: IntentType.TEXT,
                                        description: "Please provide the date for your booking.",
                                        schema: z.string(),
                                        child: {
                                            name: "booking_time",
                                            type: IntentType.TEXT,
                                            description: "Please provide the time for your booking.",
                                            schema: z.string(),
                                            child: {
                                                    name: "end",
                                                    type: IntentType.TEXT,
                                                    description: "Thank you! Your booking has been confirmed."
                                                }
                                            }
                                        }
                                    }
                            ]
                        },
                        {
                            name: "End_Cricket_No_Booking",
                            type: IntentType.TEXT,
                            description: "Thank you for your interest in Cricket! Have a great day!"
                        }
                    ]
                },
                {
                    name: "Football",
                    type: IntentType.SELECTION,
                    description: "Would you like to book grounds for Football? Yes or No.",
                    schema: z.enum(['Yes', 'No']),
                    children: [
                        {
                            name: "Football_Ground_Selection",
                            type: IntentType.SELECTION,
                            description: "Choose your ground type: Single Court or Full Ground.",
                            schema: z.enum(['Single Court', 'Full Ground']),
                            children: [
                                {
                                    name: "booking_details_football",
                                    type: IntentType.TEXT,
                                    description: "Please provide your name for the booking.",
                                    schema: z.string(),
                                    child: {
                                        name: "booking_date_football",
                                        type: IntentType.TEXT,
                                        description: "Please provide the date for your booking.",
                                        schema: z.string(),
                                        child: {
                                            name: "booking_time_football",
                                            type: IntentType.TEXT,
                                            description: "Please provide the time for your booking.",
                                            schema: z.string(),
                                            child: {
                                                    name: "end_football",
                                                    type: IntentType.TEXT,
                                                    description: "Thank you! Your booking has been confirmed."
                                                }
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            name: "End_Football_No_Booking",
                            type: IntentType.TEXT,
                            description: "Thank you for your interest in Football! Have a great day!"
                        }
                    ]
                },
                {
                    name: "Padel",
                    type: IntentType.SELECTION,
                    description: "Would you like to book grounds for Padel? Yes or No.",
                    schema: z.enum(['Yes', 'No']),
                    children: [
                        {
                            name: "Padel_Ground_Selection",
                            type: IntentType.SELECTION,
                            description: "Choose your ground type: Turf or Cemented Court.",
                            schema: z.enum(['Turf', 'Cemented Court']),
                            children: [
                                {
                                    name: "booking_details_padel",
                                    type: IntentType.TEXT,
                                    description: "Please provide your name for the booking.",
                                    schema: z.string(),
                                    child: {
                                        name: "booking_date_padel",
                                        type: IntentType.TEXT,
                                        description: "Please provide the date for your booking.",
                                        schema: z.string(),
                                        child: {
                                            name: "booking_time_padel",
                                            type: IntentType.TEXT,
                                            description: "Please provide the time for your booking.",
                                            schema: z.string(),
                                            child: {
                                                    name: "end_padel",
                                                    type: IntentType.TEXT,
                                                    description: "Thank you! Your booking has been confirmed."
                                                }
                                            }
                                        }
                                }
                            ]
                        },
                        {
                            name: "End_Padel_No_Booking",
                            type: IntentType.TEXT,
                            description: "Thank you for your interest in Padel! Have a great day!"
                        }
                    ]
                }
            ]
        }
    ]
};

export const ServiceTree: FlowTree = {
    name: "initial_greeting",
    type: IntentType.TEXT,
    description: "Welcome! I am here to assist you with services related to software creation, content creation, and graphic designing.",
    child: {
        name: "service_type",
        type: IntentType.SELECTION,
        description: "What service are you interested in?",
        schema: z.enum(['Software Creation', 'Content Creation', 'Graphic Designing']),
        children: [
            {
                name: "Software Creation",
                type: IntentType.SELECTION,
                description: "What type of software application are you interested in?",
                schema: z.enum(['Web Applications', 'AI based Applications', 'Mobile Applications']),
                children: [
                    {
                        name: "Web Applications",
                        type: IntentType.TEXT,
                        description: "Please provide your name and email for further discussion.",
                        schema: z.string(),
                        child: {
                            name: "end",
                            type: IntentType.TEXT,
                            description: "Thanks, we will get back to you soon."
                        }
                    },
                    {
                        name: "AI based Applications",
                        type: IntentType.TEXT,
                        description: "Please provide your name and email for further discussion.",
                        schema: z.string(),
                        child: {
                            name: "end",
                            type: IntentType.TEXT,
                            description: "Thanks, we will get back to you soon."
                        }
                    },
                    {
                        name: "Mobile Applications",
                        type: IntentType.TEXT,
                        description: "Please provide your name and email for further discussion.",
                        schema: z.string(),
                        child: {
                            name: "end",
                            type: IntentType.TEXT,
                            description: "Thanks, we will get back to you soon."
                        }
                    }
                ]
            },
            {
                name: "Content Creation",
                type: IntentType.SELECTION,
                description: "Are you interested in blogs or articles?",
                schema: z.enum(['Blogs', 'Articles']),
                children: [
                    {
                        name: "Blogs",
                        type: IntentType.TEXT,
                        description: "Please provide your name and email for further discussion.",
                        schema: z.string(),
                        child: {
                            name: "end",
                            type: IntentType.TEXT,
                            description: "Thanks, we will get back to you soon."
                        }
                    },
                    {
                        name: "Articles",
                        type: IntentType.TEXT,
                        description: "Please provide your name and email for further discussion.",
                        schema: z.string(),
                        child: {
                            name: "end",
                            type: IntentType.TEXT,
                            description: "Thanks, we will get back to you soon."
                        }
                    }
                ]
            },
            {
                name: "Graphic Designing",
                type: IntentType.SELECTION,
                description: "Are you interested in logo designing or poster creation?",
                schema: z.enum(['Logo Designing', 'Poster Creation']),
                children: [
                    {
                        name: "Logo Designing",
                        type: IntentType.TEXT,
                        description: "Please provide your name and email for further discussion.",
                        schema: z.string(),
                        child: {
                            name: "end",
                            type: IntentType.TEXT,
                            description: "Thanks, we will get back to you soon."
                        }
                    },
                    {
                        name: "Poster Creation",
                        type: IntentType.TEXT,
                        description: "Please provide your name and email for further discussion.",
                        schema: z.string(),
                        child: {
                            name: "end",
                            type: IntentType.TEXT,
                            description: "Thanks, we will get back to you soon."
                        }
                    }
                ]
            }
        ]
    }
};
////////////////////////////////////////////////////////// PRODUCT BASED TREES //////////////////////////////////////////////////////////

export const ElectronicStore: FlowTree ={
  name: "initial_greeting",
  type: IntentType.TEXT,
  description: "Welcome to the Electric Store! Are you interested in Laptops or Mobiles?",
  child: {
      name: "service_type",
      type: IntentType.SELECTION,
      description: "Please choose an option: Laptops or Mobiles",
      schema: z.enum(['Laptops', 'Mobiles']),
      children: [
          {
              name: "Laptops",
              type: IntentType.SELECTION,
              description: "Please choose your Price Category for Laptops.",
              schema: z.enum(['Less than 100000', 'Greater than 100000']),
              children: [
                  {
                      name: "Less than 100000",
                      type: IntentType.SELECTION,
                      description: "Please choose a Laptop: Lenovo or Dell",
                      schema: z.enum(['Lenovo', 'Dell']),
                      child: {
                          name: "user_information",
                          type: IntentType.TEXT,
                          description: "Please provide your name",
                          schema: z.string(),
                          child: {
                              name: "mobile_number",
                              type: IntentType.TEXT,
                              description: "Please provide your mobile number",
                              schema: z.string(),
                              child: {
                                  name: "end_message",
                                  type: IntentType.TEXT,
                                  description: "Thank you! We will contact you soon."
                              }
                          }
                      }
                  },
                  {
                      name: "Greater than 100000",
                      type: IntentType.SELECTION,
                      description: "Please choose a Laptop: HP or Apple",
                      schema: z.enum(['HP', 'Apple']),
                      child: {
                          name: "user_information",
                          type: IntentType.TEXT,
                          description: "Please provide your name",
                          schema: z.string(),
                          child: {
                              name: "mobile_number",
                              type: IntentType.TEXT,
                              description: "Please provide your mobile number",
                              schema: z.string(),
                              child: {
                                  name: "end_message",
                                  type: IntentType.TEXT,
                                  description: "Thank you! We will contact you soon."
                              }
                          }
                      }
                  }
              ]
          },
          {
              name: "Mobiles",
              type: IntentType.SELECTION,
              description: "Please choose your Price Category for Mobiles.",
              schema: z.enum(['Less than 25000', 'Greater than 25000']),
              children: [
                  {
                      name: "Less than 25000",
                      type: IntentType.SELECTION,
                      description: "Please choose a Mobile: Oppo A or Oppo B",
                      schema: z.enum(['Oppo A', 'Oppo B']),
                      child: {
                          name: "user_information",
                          type: IntentType.TEXT,
                          description: "Please provide your name",
                          schema: z.string(),
                          child: {
                              name: "mobile_number",
                              type: IntentType.TEXT,
                              description: "Please provide your mobile number",
                              schema: z.string(),
                              child: {
                                  name: "end_message",
                                  type: IntentType.TEXT,
                                  description: "Thank you! We will contact you soon."
                              }
                          }
                      }
                  },
                  {
                      name: "Greater than 25000",
                      type: IntentType.SELECTION,
                      description: "Please choose a Mobile: S12 or S13",
                      schema: z.enum(['S12', 'S13']),
                      child: {
                          name: "user_information",
                          type: IntentType.TEXT,
                          description: "Please provide your name",
                          schema: z.string(),
                          child: {
                              name: "mobile_number",
                              type: IntentType.TEXT,
                              description: "Please provide your mobile number",
                              schema: z.string(),
                              child: {
                                  name: "end_message",
                                  type: IntentType.TEXT,
                                  description: "Thank you! We will contact you soon."
                              }
                          }
                      }
                  }
              ]
          }
      ]
  }
};

export const GymStore: FlowTree = {
  name: "initial_greeting",
  type: IntentType.TEXT,
  description: "Welcome to the Health and Fitness Store! We offer Gym Supplements and Fitness Equipment. How can I assist you today?",
  child: {
      name: "service_type",
      type: IntentType.SELECTION,
      description: "Please select an option: Gym Supplements or Fitness Equipment.",
      schema: z.enum(['Gym Supplements', 'Fitness Equipment']),
      children: [
          {
              name: "Gym Supplements",
              type: IntentType.SELECTION,
              description: "Please select a supplement: Vanilla Protein Shake or Blueberry Protein Shake.",
              schema: z.enum(['Vanilla Protein Shake', 'Blueberry Protein Shake']),
              children: [
                  {
                      name: "Vanilla Protein Shake",
                      type: IntentType.TEXT,
                      description: "You've selected Vanilla Protein Shake. Please provide your address.",
                      schema: z.string(),
                      child: {
                          name: "address",
                          type: IntentType.TEXT,
                          description: "Please provide your address.",
                          schema: z.string(),
                          child: {
                              name: "phone_number",
                              type: IntentType.TEXT,
                              description: "Please provide your phone number.",
                              schema: z.string(),
                              child: {
                                  name: "end",
                                  type: IntentType.TEXT,
                                  description: "Thank you! Your order is confirmed. We will reach out to you soon."
                              }
                          }
                      }
                  },
                  {
                      name: "Blueberry Protein Shake",
                      type: IntentType.TEXT,
                      description: "You've selected Blueberry Protein Shake. Please provide your address.",
                      schema: z.string(),
                      child: {
                          name: "address",
                          type: IntentType.TEXT,
                          description: "Please provide your address.",
                          schema: z.string(),
                          child: {
                              name: "phone_number",
                              type: IntentType.TEXT,
                              description: "Please provide your phone number.",
                              schema: z.string(),
                              child: {
                                  name: "end",
                                  type: IntentType.TEXT,
                                  description: "Thank you! Your order is confirmed. We will reach out to you soon."
                              }
                          }
                      }
                  }
              ]
          },
          {
              name: "Fitness Equipment",
              type: IntentType.SELECTION,
              description: "Please select the type of equipment: Dumbells or Rods.",
              schema: z.enum(['Dumbells', 'Rods']),
              children: [
                  {
                      name: "Dumbells",
                      type: IntentType.SELECTION,
                      description: "Please select the weight for dumbells: 4kg or 8kg.",
                      schema: z.enum(['4kg', '8kg']),
                      children: [
                          {
                              name: "4kg",
                              type: IntentType.TEXT,
                              description: "You've selected 4kg Dumbells. Please provide your address.",
                              child: {
                                  name: "address",
                                  type: IntentType.TEXT,
                                  description: "Please provide your address.",
                                  schema: z.string(),
                                  child: {
                                      name: "phone_number",
                                      type: IntentType.TEXT,
                                      description: "Please provide your phone number.",
                                      schema: z.string(),
                                      child: {
                                          name: "end",
                                          type: IntentType.TEXT,
                                          description: "Thank you! Your order is confirmed. We will reach out to you soon."
                                      }
                                  }
                              }
                          },
                          {
                              name: "8kg",
                              type: IntentType.TEXT,
                              description: "You've selected 8kg Dumbells. Please provide your address.",
                              child: {
                                  name: "address",
                                  type: IntentType.TEXT,
                                  description: "Please provide your address.",
                                  schema: z.string(),
                                  child: {
                                      name: "phone_number",
                                      type: IntentType.TEXT,
                                      description: "Please provide your phone number.",
                                      schema: z.string(),
                                      child: {
                                          name: "end",
                                          type: IntentType.TEXT,
                                          description: "Thank you! Your order is confirmed. We will reach out to you soon."
                                      }
                                  }
                              }
                          }
                      ]
                  },
                  {
                      name: "Rods",
                      type: IntentType.SELECTION,
                      description: "Please select the weight for rods: 10kg or 20kg.",
                      schema: z.enum(['10kg', '20kg']),
                      children: [
                          {
                              name: "10kg",
                              type: IntentType.TEXT,
                              description: "You've selected 10kg Rods. Please provide your address.",
                              child: {
                                  name: "address",
                                  type: IntentType.TEXT,
                                  description: "Please provide your address.",
                                  schema: z.string(),
                                  child: {
                                      name: "phone_number",
                                      type: IntentType.TEXT,
                                      description: "Please provide your phone number.",
                                      schema: z.string(),
                                      child: {
                                          name: "end",
                                          type: IntentType.TEXT,
                                          description: "Thank you! Your order for 10kg Rods is confirmed. We will reach out to you soon."
                                      }
                                  }
                              }
                          },
                          {
                              name: "20kg",
                              type: IntentType.TEXT,
                              description: "You've selected 20kg Rods. Please provide your address.",
                              child: {
                                  name: "address",
                                  type: IntentType.TEXT,
                                  description: "Please provide your address.",
                                  schema: z.string(),
                                  child: {
                                      name: "phone_number",
                                      type: IntentType.TEXT,
                                      description: "Please provide your phone number.",
                                      schema: z.string(),
                                      child: {
                                          name: "end",
                                          type: IntentType.TEXT,
                                          description: "Thank you! Your order for 20kg Rods is confirmed. We will reach out to you soon."
                                      }
                                  }
                              }
                          }
                      ]
                  }
              ]
          }
      ]
  }
};

  //                                                                          GENERATED DYNAMICALLY                                                                            //

export const InsuranceSystem: FlowTree = {
  name: "greeting",
  type: IntentType.TEXT,
  description: "Start of the conversation - greet the user and ask for their name",
  schema: z.string(),
  child: {
      name: "user_name",
      type: IntentType.TEXT,
      description: "The name of the user",
      schema: z.string(),
      child: {
          name: "user_email",
          type: IntentType.TEXT,
          description: "Ask for the user's email",
          schema: z.string().email(),
          child: {
              name: "date_of_accident",
              type: IntentType.TEXT,
              description: "Ask for the date of the accident",
              schema: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
              child: {
                  name: "accident_details",
                  type: IntentType.TEXT,
                  description: "Ask the user for the details of the accident",
                  schema: z.string(),
                  child: {
                      name: "end_conversation",
                      type: IntentType.TEXT,
                      description: "The details have been noted.",
                      schema: z.string()
                  }
              }
          }
      }
  }
};


export const AttendanceManagementSysten: FlowTree = {
  name: "initial",
  type: IntentType.TEXT,
  description: "Initial prompt asking for user's name",
  schema: z.string(),
  child: {
      name: "roll_number",
      type: IntentType.TEXT,
      description: "Prompt asking for user's roll number",
      schema: z.string().regex(/^\\d+$/),
      child: {
          name: "conclusion",
          type: IntentType.TEXT,
          description: "Thank you for providing your details. Your attendance has been recorded."
      }
  }
};

// export const HotelManagementSysten: FlowTree ={
//   name: "welcome_message",
//   type: IntentType.TEXT,
//   description: "Welcome the user and ask for their name.",
//   schema: z.string(),
//   child: {
//       name: "user_name",
//       type: IntentType.TEXT,
//       description: "Ask for the name of the user.",
//       schema: z.string(),
//       child: {
//           name: "visit_date",
//           type: IntentType.TEXT,
//           description: "Ask for the date of visit.",
//           schema: z.string().regex(/\\d{4}-\\d{2}-\\d{2}/),
//           child: {
//               name: "credit_card_details",
//               type: IntentType.TEXT,
//               description: "Ask for the user's credit card details.",
//               schema: z.string().regex(/\\d{4}-\\d{4}-\\d{4}-\\d{4}/),
//               child: {
//                   name: "package_selection",
//                   type: IntentType.SELECTION,
//                   description: "Ask the user to choose a package.",
//                   schema: z.enum(['Deluxe', 'Premium']),
//                   child: {
//                       name: "thank_you_message",
//                       type: IntentType.TEXT,
//                       description: "Thank the user for providing their information. All data has been gathered.",
//                       schema: z.any()
//                   }
//               }
//           }
//       }
//   }
// };

export const VisaAgencySystem: FlowTree = {
  name: "greeting",
  type: IntentType.TEXT,
  description: "Welcome to the Visa Agency chatbot. How can I assist you today?",
  child: {
      name: "username",
      type: IntentType.TEXT,
      description: "Please provide your name.",
      schema: z.string(),
      child: {
          name: "cnic",
          type: IntentType.TEXT,
          description: "Please provide your CNIC number (without dashes).",
          schema: z.string().regex(/^[0-9]{13}$/),
          child: {
              name: "passport_number",
              type: IntentType.TEXT,
              description: "Please provide your passport number.",
              schema: z.string().regex(/^[a-zA-Z0-9]{6,9}$/),
              child: {
                  name: "travel_date",
                  type: IntentType.TEXT,
                  description: "Please provide your intended date of travel (YYYY-MM-DD).",
                  schema: z.string().regex(/^(20[2-9][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/),
                  child: {
                      name: "confirmation",
                      type: IntentType.TEXT,
                      description: "Thank you! Your data has been gathered. If you need further assistance, please let me know."
                  }
              }
          }
      }
  }
};

export const DoctorAppointmentSystem: FlowTree = {
  name: "greeting",
  type: IntentType.TEXT,
  description: "Welcome to the clinic. May I have your name?",
  child: {
      name: "patient_name",
      type: IntentType.TEXT,
      description: "Please provide your full name.",
      schema: z.string().min(1, "Name cannot be empty").max(100, "Name is too long"),
      child: {
          name: "patient_age",
          type: IntentType.TEXT,
          description: "May I know your age?",
          schema: z.number().min(0, "Age must be non-negative").max(150, "Please enter a valid age"),
          child: {
              name: "patient_weight",
              type: IntentType.TEXT,
              description: "Could you please mention your weight in kilograms?",
              schema: z.number().min(1, "Weight must be positive").max(500, "Please enter a valid weight"),
              child: {
                  name: "patient_disease",
                  type: IntentType.TEXT,
                  description: "Please describe your current health issue or disease.",
                  schema: z.string().min(3, "Disease description must be at least 3 characters").max(500, "Disease description is too long"),
                  child: {
                      name: "confirmation",
                      type: IntentType.TEXT,
                      description: "Thank you. Your information has been gathered. We will get back to you shortly to schedule your appointment."
                  }
              }
          }
      }
  }
};

export const System: FlowTree = {
    name: "initial_greeting",
    type: IntentType.TEXT,
    description: "Welcome to the Insurance Management System! I can assist you with claims processing.",
    child: {
        name: "service_type",
        type: IntentType.SELECTION,
        description: "Please select what you would like to do: Check Claim Status or Submit a New Claim.",
        schema: z.enum(['Check Claim Status', 'Submit New Claim'
        ]),
        children: [
            {
                name: "Check Claim Status",
                type: IntentType.TEXT,
                description: "Please provide your name.",
                schema: z.string(),
                child: {
                    name: "user_phone_number",
                    type: IntentType.TEXT,
                    description: "Please provide your phone number.",
                    schema: z.string(),
                    child: {
                        name: "user_age",
                        type: IntentType.TEXT,
                        description: "Please provide your age.",
                        schema: z.string(),
                        child: {
                            name: "reference_number",
                            type: IntentType.TEXT,
                            description: "Please provide your claim reference number.",
                            schema: z.string(),
                            child: {
                                name: "end_check_claim",
                                type: IntentType.TEXT,
                                description: "Thanks, I will check the status of your claim and get back to you shortly."
                            }
                        }
                    }
                }
            },
            {
                name: "Submit New Claim",
                type: IntentType.TEXT,
                description: "Please provide your name.",
                schema: z.string(),
                child: {
                    name: "new_claim_user_phone_number",
                    type: IntentType.TEXT,
                    description: "Please provide your phone number.",
                    schema: z.string(),
                    child: {
                        name: "new_claim_user_age",
                        type: IntentType.TEXT,
                        description: "Please provide your age.",
                        schema: z.string(),
                        child: {
                            name: "accident_details",
                            type: IntentType.TEXT,
                            description: "Please describe the details of the accident.",
                            schema: z.string(),
                            child: {
                                name: "end_submit_claim",
                                type: IntentType.TEXT,
                                description: "Thank you! Your claim has been submitted. We will get back to you soon."
                            }
                        }
                    }
                }
            }
        ]
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const RestaurantOrderSystem: FlowTree = {
    name: "initial_greeting",
    type: IntentType.TEXT,
    description: "Welcome to our Restaurant Order System! Would you like to dine in or take away?",
    child: {
        name: "service_type",
        type: IntentType.SELECTION,
        description: "Please choose your service type.",
        schema: z.enum(['Dine In', 'Take Away'
        ]),
        children: [
            {
                name: "Dine In",
                type: IntentType.SELECTION,
                description: "Would you like to order biryani or nihari?",
                schema: z.enum(['Biryani', 'Nihari'
                ]),
                child: {
                    name: "end_dine_in",
                    type: IntentType.TEXT,
                    description: "Thank you for your order! We'll serve you soon."
                }
            },
            {
                name: "Take Away",
                type: IntentType.SELECTION,
                description: "Would you like to order biryani or nihari?",
                schema: z.enum(['Biryani', 'Nihari'
                ]),
                child: {
                    name: "visit_time",
                    type: IntentType.TEXT,
                    description: "Please provide your time of visit.",
                    schema: z.string(),
                    child: {
                        name: "end_take_away",
                        type: IntentType.TEXT,
                        description: "Thank you for your order! We will have it ready for you."
                    }
                }
            }
        ]
    }
}

export const VehicleMaintenanceSystem: FlowTree = {
  name: "service_type",
  type: IntentType.TEXT,
  description: "Ask the user to select a type of vehicle service",
  schema: z.enum(['oil_change', 'tire_rotation', 'engine_diagnostic']),
  child: {
      name: "vehicle_model",
      type: IntentType.TEXT,
      description: "Ask the user for their vehicle model - keep the question simple",
      schema: z.string(),
      child: {
          name: "appointment_date",
          type: IntentType.TEXT,
          description: "Ask the user to choose a date for their appointment",
          schema: z.string(),
          child: {
              name: "confirmation",
              type: IntentType.TEXT,
              description: "Your appointment has been confirmed."
          }
      }
  }
};


export const supportNewRequest: FlowTree = {
  name: 'branch',
  type: IntentType.TEXT,
  description:
    'The branch of Civil Affairs - (الأحوال المدنية) that the customer is in',
  schema: z.enum(['الرياض قرطبة', 'الرياض خريص', 'الرياض رويال مول', 'تجريبي']),
  child: {
    name: 'customer_name',
    type: IntentType.TEXT,
    description: "The name of the customer - don't include other details",
    schema: z.string(),

    child: {
      name: 'customer_phone_number',
      type: IntentType.TEXT,
      description: 'The phone number of the customer',
      schema: z.string().regex(/^(?:\+?9665\d{8}|05\d{8}|5\d{8})$/),
      child: {
        name: 'request_subject',
        type: IntentType.TEXT,
        description:
          'write a brief generic title from the customer request details without customer details, response must be in {{language}}',
        schema: z.string(),
        child: {
          name: 'request_details',
          type: IntentType.TEXT,
          description:
            'what is the customer complaint about? if no details was provided return "not_specified" but in the followup dont tell the customer to return "not_specified"',
          schema: z.string(),
          child: {
            name: 'reference_number',
            type: IntentType.TEXT,
            description: 'The reference number of the request',
            schema: z.number(),
          },
        },
      },
    },
  },
};

// export const HRDFDubaiFlow: FlowTree = {
//   name: 'initial',
//   description: 'this section is for owners of domestic workers',
//   children: [
//     {
//       name: 'order_status',
//       description: 'the user wants to check the status of his order',
//       children: [
//         {
//           name: 'order_id',
//           description: 'What is the order ID?',
//           schema: z.number(),
//         },
//       ],
//     },
//     {
//       name: 'services',
//       description: 'the user wants to know about the services',
//     },
//     {
//       name: 'legal_inquiries_and_complaints',
//       description: 'the user has legal inquiries or complaints',
//       children: [
//         {
//           name: 'get_copy_of_law',
//           description: 'the user wants a copy of the law',
//         },
//         {
//           name: 'complaints_on_recruitment_agencies',
//           description: 'the user wants to complain about recruitment agencies',
//         },
//         {
//           name: 'labor_complaints',
//           description: 'the user wants to file a labor complaint',
//           children: [
//             {
//               name: 'smart_app_mohre',
//               description:
//                 'the user wants to file a labor complaint using the smart app mohre',
//               children: [
//                 {
//                   name: 'apple_user',
//                   description: 'the user is an apple user',
//                 },
//                 {
//                   name: 'android_user',
//                   description: 'the user is an android user',
//                 },
//               ],
//             },
//             {
//               name: 'mohre_website',
//               description:
//                 'the user wants to file a labor complaint using the mohre website',
//             },
//             {
//               name: 'consultation_and_labor_claims_center',
//               description:
//                 'the user wants to file a labor complaint using the consultation and labor claims center',
//             },
//           ],
//         },
//       ],
//     },
//     {
//       name: 'support',
//       description:
//         'the user wants to contact support, give feedback, suggestions or thanks',
//       children: [
//         {
//           name: 'new_request',
//           description: 'the user wants to create a new request',
//           children: [
//             {
//               name: 'contact_support',
//               description: 'the user wants to contact support',
//               child: supportNewRequest,
//             },
//             {
//               name: 'complaints',
//               description: 'the user wants to file a complaint',
//               child: supportNewRequest,
//             },
//             {
//               name: 'suggestions',
//               description: 'the user wants to give suggestions',
//               child: supportNewRequest,
//             },
//             {
//               name: 'thanks_or_feedback',
//               description: 'the user wants to give thanks or feedback',
//               child: supportNewRequest,
//             },
//           ],
//         },
//         {
//           name: 'request_status',
//           description: 'the user wants to check the status of his request',
//           children: [
//             {
//               name: 'request_id',
//               description: 'What is the request ID?',
//               schema: z.number(),
//             },
//           ],
//         },
//         {
//           name: 'other_inquiries',
//           description: 'the user has other inquiries',
//         },
//       ],
//     },
//   ],
// };

export const HRDFDubaiFlow: FlowTree = {
  name: 'initial',
  type: IntentType.SELECTION,
  description:
    'this section is for civil affairs services for citizens and residents of Saudi Arabia',
  children: [
    {
      name: 'complaints',
      type: IntentType.SELECTION,
      description:
        'the user wants to file a complaint or has a complaint about a service',
      children: [
        {
          name: 'new_complaint',
          type: IntentType.INTERMEDIATE,
          description: 'the user wants to create a new request',
          child: supportNewRequest,
        },
        {
          name: 'follow_up_complaint',
          type: IntentType.INTERMEDIATE,
          description: 'the user wants to follow up on a complaint',
          child: {
            name: 'complaint_id',
            type: IntentType.TEXT,
            description: 'The complaint ID',
            schema: z.number(),
            child: {
              name: 'end',
              type: IntentType.TEXT,
              description: 'End of the flow',
            },
          },
        },
      ],
    },
    {
      name: 'id_renewal',
      type: IntentType.INTERMEDIATE,
      description: 'the user wants to renew his ID',
      child: {
        name: 'id_number',
        type: IntentType.TEXT,
        description:
          'The user ID Card number رقم الهوية الوطنية- it consists of 10 digits and starts with 1',
        schema: z.string().regex(/^1[0-9]{9}/),
        child: {
          name: 'full_name',
          type: IntentType.TEXT,
          description: 'The user full name',
          schema: z.string(),
          child: {
            name: 'national_address',
            type: IntentType.TEXT,
            schema: z.string().regex(/[A-Z0-9]{8}/),
            description:
              'The user national address to send the ID to, the National address is a 8 length code made of numbers and letters',
            child: {
              name: 'user_image',
              type: IntentType.TEXT,
              description: 'The user image to be printed on the ID',
              schema: z.string(),
              child: {
                name: 'end',
                type: IntentType.TEXT,
                description: 'End of the flow',
              },
            },
          },
        },
      },
    },
    {
      name: 'unknown',
      type: IntentType.TEXT,
      description:
        "If the user's question does not fall into any of the above categories.",
    },
  ],
};
