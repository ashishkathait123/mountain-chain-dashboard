import React from 'react';
import { useOutletContext } from 'react-router-dom';
import TripList from './Trips';


function Canceled() {
	
  const { filter, token } = useOutletContext();
  return <TripList status="Canceled" filter={filter} token={token} />;
}

export default Canceled;