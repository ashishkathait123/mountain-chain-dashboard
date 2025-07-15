import React from 'react';
import { useOutletContext } from 'react-router-dom';
import TripList from './Trips';

function InProgress() {
  const { filter, token } = useOutletContext();
  return <TripList status="In Progress" filter={filter} token={token} />;
}

export default InProgress;