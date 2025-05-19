
/**
 * Validation and mapping for imported fitness JSON data.
 */
const REQUIRED_MEAL_FIELDS = ["Date", "Day", "Meal", "Cals"];
const MAP_MEAL_FIELDS = {
  Date: "Date",
  Day: "Day",
  Meal: "Meal",
  Name: "Name",
  BrandName: "BrandName",
  Amount: "Amount",
  Unit: "Unit",
  Cals: "Cals",
  Carbs: "Carbs",
  Fat: "Fat",
  Protein: "Protein",
};

const MAP_ACTIVITY_FIELDS = {
  Date: "Date",
  "Cals Out": "Cals Out",
};

const MAP_WATER_FIELDS = {
  Date: "Date",
  Water: "Water",
};

/**
 * Processes nutrition data format where data is organized by dates
 * Format: { "2025-04-22": { foods: [...], summary: {...} }, ... }
 */
function processNutritionFormat(json: any): { success: boolean, message: string, mappedData?: any } {
  try {
    const allMeals: any[] = [];
    const allActivities: any[] = [];
    const allWater: any[] = [];

    // Iterate through each date in the nutrition data
    Object.keys(json).forEach(date => {
      const dayData = json[date];
      
      // Process foods for this date
      if (dayData.foods && Array.isArray(dayData.foods)) {
        dayData.foods.forEach((food: any, index: number) => {
          // Ensure we have either loggedFood or nutritionalValues
          if (!food.nutritionalValues) return;
          
          const mealTypeMap: {[key: number]: string} = {
            1: "Breakfast",
            2: "Lunch",
            3: "Dinner",
            4: "Snack",
            5: "Dinner", // Additional meal types mapped to our standard types
            6: "Snack"
          };

          // Get meal type from loggedFood if it exists, otherwise default to "Snack"
          const mealType = food.loggedFood?.mealTypeId 
            ? mealTypeMap[food.loggedFood.mealTypeId] || "Snack"
            : "Snack";

          // Generate a name if it doesn't exist
          const foodName = food.loggedFood?.name || food.description || `Food item ${index + 1}`;
          
          allMeals.push({
            Date: food.logDate || date,
            Day: new Date(food.logDate || date).toLocaleDateString('en-US', { weekday: 'long' }),
            Meal: mealType,
            Name: foodName,
            BrandName: food.loggedFood?.brand || "",
            Amount: food.loggedFood?.amount?.toString() || "1",
            Unit: food.loggedFood?.unit?.name || "serving",
            Cals: food.nutritionalValues.calories?.toString() || "0",
            Carbs: (food.nutritionalValues.carbs || 0).toString(),
            Fat: (food.nutritionalValues.fat || 0).toString(),
            Protein: (food.nutritionalValues.protein || 0).toString()
          });
        });
      }

      // Process summary data for activities (calories out)
      if (dayData.goals && dayData.goals.estimatedCaloriesOut) {
        allActivities.push({
          Date: date,
          "Cals Out": dayData.goals.estimatedCaloriesOut.toString()
        });
      }

      // Process water data
      if (dayData.summary && typeof dayData.summary.water !== 'undefined') {
        allWater.push({
          Date: date,
          Water: dayData.summary.water.toString()
        });
      }
    });

    if (allMeals.length === 0) {
      return { success: false, message: "No valid meal data found in the nutrition format" };
    }

    return {
      success: true,
      message: "Valid nutrition JSON format",
      mappedData: {
        meals: allMeals,
        activities: allActivities,
        water: allWater
      }
    };
  } catch (error) {
    console.error("Error processing nutrition format:", error);
    return { success: false, message: "Error processing nutrition format data" };
  }
}

export function flexibleValidateAndMap(json: any): { success: boolean, message: string, mappedData?: any } {
  // First check if this is the nutrition.json format (organized by dates)
  if (typeof json === 'object' && !Array.isArray(json) && !json.meals) {
    const firstKey = Object.keys(json)[0];
    if (firstKey && json[firstKey] && (json[firstKey].foods || json[firstKey].summary)) {
      return processNutritionFormat(json);
    }
  }

  // If not nutrition format, proceed with original validation for meals array
  if (!Array.isArray(json.meals)) {
    return { success: false, message: "Missing required array: meals" };
  }
  
  const mappedMeals = json.meals.map((meal: any, idx: number) => {
    for (const f of REQUIRED_MEAL_FIELDS) {
      if (typeof meal[f] === 'undefined' || meal[f] === null || meal[f] === "") {
        return { __invalid: true, idx, field: f };
      }
    }
    const mapped: any = {};
    for (const targetField in MAP_MEAL_FIELDS) {
      const sourceField = MAP_MEAL_FIELDS[targetField];
      mapped[sourceField] = typeof meal[sourceField] === "undefined" ? "" : meal[sourceField];
    }
    return mapped;
  });
  
  for (const entry of mappedMeals) {
    if (entry && entry.__invalid) {
      return {
        success: false,
        message: `Meal entry #${entry.idx + 1} is missing required field: ${entry.field}`,
      };
    }
  }
  
  let mappedActivities = [];
  if (json.activities) {
    if (!Array.isArray(json.activities)) {
      return { success: false, message: "If provided, 'activities' must be an array." };
    }
    mappedActivities = json.activities.map((act: any, idx: number) => {
      for (const required of ["Date", "Cals Out"]) {
        if (typeof act[required] === "undefined" || act[required] === null || act[required] === "") {
          return { __invalid: true, idx, field: required };
        }
      }
      const mapped: any = {};
      for (const targetField in MAP_ACTIVITY_FIELDS) {
        const sourceField = MAP_ACTIVITY_FIELDS[targetField];
        mapped[sourceField] = typeof act[sourceField] === "undefined" ? "" : act[sourceField];
      }
      return mapped;
    });
    
    for (const entry of mappedActivities) {
      if (entry && entry.__invalid) {
        return {
          success: false,
          message: `Activity entry #${entry.idx + 1} is missing required field: ${entry.field}`,
        };
      }
    }
  }
  
  let mappedWater = [];
  if (json.water) {
    if (!Array.isArray(json.water)) {
      return { success: false, message: "If provided, 'water' must be an array." };
    }
    mappedWater = json.water.map((row: any, idx: number) => {
      for (const required of ["Date", "Water"]) {
        if (typeof row[required] === "undefined" || row[required] === null || row[required] === "") {
          return { __invalid: true, idx, field: required };
        }
      }
      const mapped: any = {};
      for (const targetField in MAP_WATER_FIELDS) {
        const sourceField = MAP_WATER_FIELDS[targetField];
        mapped[sourceField] = typeof row[sourceField] === "undefined" ? "" : row[sourceField];
      }
      return mapped;
    });
    
    for (const entry of mappedWater) {
      if (entry && entry.__invalid) {
        return {
          success: false,
          message: `Water entry #${entry.idx + 1} is missing required field: ${entry.field}`,
        };
      }
    }
  }
  
  return {
    success: true,
    message: "Valid JSON",
    mappedData: {
      meals: mappedMeals,
      activities: mappedActivities,
      water: mappedWater,
    },
  };
}
