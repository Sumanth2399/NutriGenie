import React, { useState, useContext } from "react";
import { AuthContext } from "../context/authContext";
import "../styles/calorieTracker.css";
import API from "../api";

const CalorieTracker = () => {
  const { user } = useContext(AuthContext);
  const [foodItems, setFoodItems] = useState([{ food: "", quantity: "" }]);
  const [mealType, setMealType] = useState("breakfast");
  const [mealDate, setMealDate] = useState(new Date().toISOString().split("T")[0]);
  const [suggestions, setSuggestions] = useState({});
  const [activeInputIndex, setActiveInputIndex] = useState(null);
  const [totalCalories, setTotalCalories] = useState(null);
  const [mealBreakdown, setMealBreakdown] = useState([]);



  const handleFoodChange = (index, e) => {
    const updated = [...foodItems];
    updated[index].food = e.target.value;
    setFoodItems(updated);
    setActiveInputIndex(index);
    fetchSuggestions(index, e.target.value);
  };

  const handleQuantityChange = (index, e) => {
    const updated = [...foodItems];
    updated[index].quantity = e.target.value;
    setFoodItems(updated);
  };

  const handleSuggestionClick = (index, suggestion) => {
    const updated = [...foodItems];
    updated[index].food = suggestion.fooditem;
    setFoodItems(updated);
    setSuggestions({ ...suggestions, [index]: [] });
  };

  const handleAddFoodItem = () => {
    setFoodItems([...foodItems, { food: "", quantity: "" }]);
  };

  const fetchSuggestions = async (index, query) => {
    if (query.length < 2) return;
    try {
      const res = await API.post("/api/calories/get-suggestions", { query });
      setSuggestions({ ...suggestions, [index]: res.data });
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const promises = foodItems.map(item =>
        API.post("/api/calories/get-calories", { food: item.food })
      );
  
      const responses = await Promise.all(promises);
      const parsedCalories = responses.map(res => parseFloat(res.data.calories || 0));
  
      const total = parsedCalories.reduce((sum, cal, i) => {
        const qty = parseFloat(foodItems[i].quantity);
        return !isNaN(cal) && !isNaN(qty) ? sum + (cal * qty) / 100 : sum;
      }, 0);
  
      setTotalCalories(total);

// Store breakdown separately for display
const breakdown = foodItems.map((item, i) => ({
    food: item.food,
    quantity: parseFloat(item.quantity),
    calories: parsedCalories[i], // <-- This is what the backend needs!
  }));
  
setMealBreakdown(breakdown);

  
await API.post("/api/meal/log-meal", {
    userId: user._id,
    date: mealDate,
    mealType,
    foodItems: breakdown,
    totalCalories: total,
  });
  
  
      // Show toast
      alert("✅ Meal has been logged successfully!");

  
      // Hide toast and reset form after 3 seconds
      setTimeout(() => {
        setFoodItems([{ food: "", quantity: "" }]);
        setSuggestions({});
        setActiveInputIndex(null);
      }, 3000);
      
  
    } catch (err) {
      console.error("Error calculating or logging calories:", err);
      alert("Error logging meal");
    }
  };
  

  return (
    <div className="calorie-tracker-page">
      <h2>Meal Logger</h2>

      <form onSubmit={handleSubmit}>
        <label>Meal Date:</label>
        <input type="date" value={mealDate} onChange={(e) => setMealDate(e.target.value)} />

        <label>Meal Type:</label>
        <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </select>

        {foodItems.map((item, index) => (
          <div key={index} className="food-entry">
            <input
              id={`food-item-${index}`}
              type="text"
              value={item.food}
              onChange={(e) => handleFoodChange(index, e)}
              onFocus={() => setActiveInputIndex(index)}
              required
              autoComplete="off"
            />

            {suggestions[activeInputIndex]?.length > 0 &&
              index === activeInputIndex && (
                <ul className="suggestions-list">
                  {suggestions[activeInputIndex].map((suggestion, i) => (
                    <li key={i} onClick={() => handleSuggestionClick(index, suggestion)}>
                      {suggestion.fooditem}
                    </li>
                  ))}
                </ul>
              )}

            <input
              type="number"
              placeholder="Quantity (grams)"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(index, e)}
              required
            />
          </div>
        ))}

        {/* ✅ Button container with spacing */}
        <div className="button-group">
          <button type="button" onClick={handleAddFoodItem}>+ Add Food</button>
          <button type="submit">Log Meal</button>
        </div>
      </form>



      {totalCalories !== null && (
  <div className="results">
    <h3>Total Calories Consumed</h3>
    <p><strong>{totalCalories.toFixed(2)} kcal</strong></p>
    <p>Date: {mealDate}</p>
    <p>Meal Type: {mealType.charAt(0).toUpperCase() + mealType.slice(1)}</p>

    <div className="meal-breakdown">
      <h4>Meal Breakdown:</h4>
      <ul>
      <ul>
      {mealBreakdown.map((item, index) => {
  const itemCalories = !isNaN(item.calories) && !isNaN(item.quantity)
    ? (item.calories * item.quantity) / 100
    : 0;

  return (
    <li key={index}>
      🍽️ {item.food} – {itemCalories.toFixed(2)} kcal ({item.quantity}g)
    </li>
  );
})}

</ul>

      </ul>
    </div>
  </div>
)}

    </div>
  );
};

export default CalorieTracker;
