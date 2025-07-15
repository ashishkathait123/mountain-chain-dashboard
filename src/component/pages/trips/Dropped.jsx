import React from 'react';
import { useOutletContext } from 'react-router-dom';
import TripList from './Trips';

function Dropped() {
  const { filter, token } = useOutletContext();
  
  return <TripList status="Dropped" filter={filter} token={token} />;
}

export default Dropped;