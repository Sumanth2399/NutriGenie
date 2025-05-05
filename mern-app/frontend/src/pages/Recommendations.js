import React, { useEffect, useState, useContext } from "react";
import API from "../api";
import "../styles/analytics.css";
import { AuthContext } from "../context/authContext";

const Recommendations = () => {
  const { user } = useContext(AuthContext);

  const [recommendations, setRecommendations] = useState([]);
  const [basis, setBasis] = useState("");
  const [userProfile, setUserProfile] = useState({});
  const [recentMeals, setRecentMeals] = useState([]);
  const [recentActivity, setRecentActivity] = useState({});
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    age: "",
    weight: "",
    height: "",
    gender: "",
    dietaryPreference: "",
    activityLevel: "",
  });
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchAllData = async () => {
        try {
          const [profileRes, mealsRes, fitnessRes, recoRes] = await Promise.all([
            API.get("/api/recommendations/profile"),
            API.get("/api/recommendations/meals"),
            API.get("/api/recommendations/fitness"),
            API.get("/api/recommendations"),
          ]);
      
          // Profile
          setUserProfile(profileRes.data || {});
          if (profileRes.data) {
            setProfileForm({
              age: profileRes.data.age || "",
              weight: profileRes.data.weight || "",
              height: profileRes.data.height || "",
              gender: profileRes.data.gender || "",
              dietaryPreference: profileRes.data.dietaryPreference || "",
              activityLevel: profileRes.data.activityLevel || "",
            });
          }
      
          // Meals
          setRecentMeals(mealsRes.data || []);
      
          // Fitness
          setRecentActivity(fitnessRes.data || {});
      
          // Recommendations
          setRecommendations(recoRes.data.suggestions || []);
          setBasis(recoRes.data.basis || "Analyzed your recent meals and fitness activity.");
      
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      

    fetchAllData();
  }, [user, refreshFlag]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/api/recommendations/profile", profileForm);
      setSuccessMessage("✅ Profile saved successfully!");
      setEditProfile(false);
      setRefreshFlag(prev => !prev);
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  return (
    <div className="analytics-container">
      <h2 className="analytics-heading">Personalized Recommendations</h2>

      {successMessage && (
        <div className="success-message" style={{ color: "green", marginBottom: "10px" }}>
          {successMessage}
        </div>
      )}

      {/* Basis */}
      <div className="analytics-section">
        <h3>📋 Basis of Recommendation</h3>
        <p>{basis}</p>
      </div>

      {/* Profile */}
      <div className="analytics-section">
        <h3>🙋 User's Existing Profile</h3>
        {userProfile && userProfile.age ? (
          <ul className="top-meals-list">
            <li><strong>Age:</strong> {userProfile.age}</li>
            <li><strong>Weight:</strong> {userProfile.weight} kg</li>
            <li><strong>Height:</strong> {userProfile.height} cm</li>
            <li><strong>Gender:</strong> {userProfile.gender}</li>
            <li><strong>Dietary Preference:</strong> {userProfile.dietaryPreference}</li>
            <li><strong>Activity Level:</strong> {userProfile.activityLevel}</li>
          </ul>
        ) : (
          <p>No profile data found. Please add your profile.</p>
        )}
        <button onClick={() => setEditProfile(!editProfile)} style={{ marginTop: "10px" }}>
          {editProfile ? "Cancel" : "➕ Add / Edit Profile"}
        </button>
      </div>

      {editProfile && (
        <div className="analytics-section">
          <h3>Add/Edit Profile</h3>
          <form onSubmit={handleProfileSubmit}>
            <input type="number" placeholder="Age" value={profileForm.age}
              onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })} required />
            <input type="number" placeholder="Weight (kg)" value={profileForm.weight}
              onChange={(e) => setProfileForm({ ...profileForm, weight: e.target.value })} required />
            <input type="number" placeholder="Height (cm)" value={profileForm.height}
              onChange={(e) => setProfileForm({ ...profileForm, height: e.target.value })} required />
            <select value={profileForm.gender}
              onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })} required >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <select value={profileForm.dietaryPreference}
              onChange={(e) => setProfileForm({ ...profileForm, dietaryPreference: e.target.value })} required >
              <option value="">Select Dietary Preference</option>
              <option value="Omnivore">Omnivore</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
            </select>
            <select value={profileForm.activityLevel}
              onChange={(e) => setProfileForm({ ...profileForm, activityLevel: e.target.value })} required >
              <option value="">Select Activity Level</option>
              <option value="Sedentary">Sedentary</option>
              <option value="Lightly Active">Lightly Active</option>
              <option value="Moderately Active">Moderately Active</option>
              <option value="Very Active">Very Active</option>
            </select>
            <button type="submit" style={{ marginTop: "10px" }}>Save Profile</button>
          </form>
        </div>
      )}

      {/* Meals */}
      <div className="analytics-section">
        <h3>🍽️ Recent Meals</h3>
        {recentMeals.length > 0 ? (
          <ul className="top-meals-list">
            {recentMeals.map((meal, idx) => (
              <li key={idx}>
                <strong>{meal.mealType}</strong> - {meal.totalCalories} calories
              </li>
            ))}
          </ul>
        ) : (
          <p>No meal records found.</p>
        )}
      </div>

      {/* Fitness */}
      <div className="analytics-section">
        <h3>🏃‍♂️ Recent Activity</h3>
        {recentActivity && recentActivity.totalSteps ? (
          <ul className="top-meals-list">
            <li><strong>Total Steps:</strong> {recentActivity.totalSteps}</li>
            <li><strong>Total Distance:</strong> {recentActivity.totalDistance} meters</li>
            <li><strong>Total Calories Burned:</strong> {recentActivity.totalCalories} kcal</li>
          </ul>
        ) : (
          <p>No fitness activity found.</p>
        )}
      </div>

      {/* Recommendations */}
      <div className="analytics-section">
  <h3>📝 Final Recommendations</h3>
  {recommendations.length === 0 ? (
    <p>No recommendations available yet. Keep tracking!</p>
  ) : (
    recommendations.map((rec, idx) => (
      <div key={idx} className="analytics-section">
        <h3>{rec.title}</h3>
        {rec.recommendations.length === 0 ? (
          <p>No specific recommendations under this section.</p>
        ) : (
          <ul className="top-meals-list">
            {rec.recommendations.map((item, idy) => (
              <li key={idy}>
                {typeof item === "object" ? (
                  <div>
                    <strong>Breakfast:</strong> {item.breakfast}<br />
                    <strong>Lunch:</strong> {item.lunch}<br />
                    <strong>Dinner:</strong> {item.dinner}<br />
                    <strong>Snack:</strong> {item.snack}
                  </div>
                ) : (
                  item
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    ))
  )}
</div>


    </div>
  );
};

export default Recommendations;
