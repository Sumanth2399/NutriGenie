# REAL-TIME-NUTRIENT-INTAKE-OPTIMIZER
NutriGenie is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application that empowers users to take control of their nutrition and fitness by providing personalized, real-time dietary recommendations based on meal intake and activity levels.

🚀 Key Features
🔗 Google Fit Integration: Sync real-time metrics such as steps, calories burned, and distance walked.

🍽️ Meal Logging: Add and analyze your daily meals, calories, and nutrients.

⚙️ Smart Recommendations: Get personalized suggestions based on your profile, meals, and fitness activity.

📊 Visual Analytics: Interactive graphs to compare calories consumed vs. burned, top meals, and nutrient trends.

🔒 Secure Authentication: JWT-based user login and protection.

🤖 ML Integration: Backend uses Python + scikit-learn/XGBoost for nutrient deficiency prediction and dietary advice.

📌 Problem Statement
Most fitness apps operate in isolation—either tracking steps or logging meals. NutriGenie addresses this gap by combining these elements and delivering personalized, real-time suggestions to promote better health.

📂 Tech Stack
| Layer       | Tools Used |
|-------------|------------|
| Frontend    | React.js, Tailwind CSS, Recharts |
| Backend     | Node.js, Express.js |
| Database    | MongoDB |
| Auth        | JWT |
| ML Models   | Python, scikit-learn, XGBoost |
| Deployment  | Vercel (frontend), Railway/Render/Heroku (backend), MongoDB Atlas |

📐 Architecture Overview
Frontend collects user input and displays analytics.

Backend API processes user data, generates recommendations, and integrates with Google Fit.

ML Module (Python) evaluates nutrient deficiencies and suggests corrective actions.

🧪 Datasets Used
Food & Nutrition Dataset: Nutritional profiles categorized by age, gender, activity, and diet preference.

Diet Recommendation Dataset: Tailored advice based on nutrient intake patterns and physical activity.

📈 Data Flow & Recommendation Logic
Meal data → Parsed → Calories Calculated

Fitness data → Synced via Google Fit

Profile filters applied → ML logic triggered

Personalized suggestions generated → Displayed via graphs/UI

📦 Available Scripts
In the project directory:

bash
Copy
Edit
npm start           # Run frontend
npm run dev         # Run backend (if setup in package.json)
npm test            # Run tests
npm run build       # Build frontend for production
