import React from 'react';
import { useOutletContext } from 'react-router-dom';
import TripList from './Trips';

function OnTrip() {
  const { filter, token } = useOutletContext();
  return <TripList status="On Trip" filter={filter} token={token} />;
}

export default OnTrip;