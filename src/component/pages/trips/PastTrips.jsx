import React from 'react';
import { useOutletContext } from 'react-router-dom';
import TripList from './Trips';

function PastTrips() {
  const { filter, token } = useOutletContext();
  return <TripList status="Past Trips" filter={filter} token={token} />;
}

export default PastTrips;