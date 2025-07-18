import React, { useState } from 'react';
import Select, { components } from 'react-select';

// Meal options
const MEALS_ENUM = ['AP', 'BB', 'CP', 'EP', 'FB', 'HB', 'MAP', 'RO'];

const mealOptions = MEALS_ENUM.map((meal) => ({
  value: meal,
  label: meal,
}));

// Custom checkbox-styled option
const CustomOption = (props) => {
  return (
    <components.Option {...props}>
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => null}
        className="mr-2"
      />
      {props.label}
    </components.Option>
  );
};

// Full section (not a separate component)
const MealPlansSection = () => {
  const [selectedMeals, setSelectedMeals] = useState([]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Meal Plans</h2>
      <Select
        isMulti
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        options={mealOptions}
        components={{ Option: CustomOption }}
        onChange={setSelectedMeals}
        value={selectedMeals}
        placeholder="Select meals..."
        className="w-full"
        classNamePrefix="react-select"
      />
    </div>
  );
};

export default MealPlansSection;
