// MealPlansSection.jsx
import React from 'react';
import Select, { components } from 'react-select';

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

// Updated reusable section component
const MealPlansSection = ({ selectedMeals, onMealChange }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Meal Plans</h2>
      <Select
        isMulti
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        options={mealOptions}
        components={{ Option: CustomOption }}
        onChange={onMealChange}
        value={selectedMeals}
        placeholder="Select meals..."
        className="w-full"
        classNamePrefix="react-select"
      />
    </div>
  );
};

export default MealPlansSection;
