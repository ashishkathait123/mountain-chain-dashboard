import React from 'react';
import { useOutletContext } from 'react-router-dom';
import TripList from './Trips';


function Converted() {

  const { filter, token } = useOutletContext();
  return <TripList status="Converted" filter={filter} token={token} />;
}

export default Converted;