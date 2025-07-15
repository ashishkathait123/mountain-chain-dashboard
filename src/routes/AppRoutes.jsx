import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../component/Layout';

import Login from '../component/pages/auth/Login';


import AdminDashboard from '../component/pages/Dashboard/AdminDashboard';
import SalesPersonDashboard from '../component/pages/Dashboard/SalesPersonDashboard';
 
import Password from '../component/pages/settings/Profile/Password';
import Appearance from '../component/pages/settings/Profile/Apperance';
import SecurityLogs from '../component/pages/settings/Profile/Security';
import ProfileSection from '../component/pages/settings/Profile/Profile';
import OrganizationLayout from '../component/pages/settings/Organization/Organizationlayut';
import OrganizationRepository from '../component/pages/settings/Organization/Repository';
import OrganizationUsers from '../component/pages/settings/Organization/User';
import OrganizationSettings from '../component/pages/settings/Organization/Setting';
import OrganizationDestinations from '../component/pages/settings/Organization/Destinations';
import OrganizationTripSources from '../component/pages/settings/Organization/TripSource';
import OrganizationEmailTemplates from '../component/pages/settings/Organization/EmailTemplates';
import OrganizationHotelPaymentPrefs from '../component/pages/settings/Organization/HotelPaymentPrefs';
import OrganizationTermsConditions from '../component/pages/settings/Organization/TermConditions';
import OrganizationInclusionsExclusions from '../component/pages/settings/Organization/InclusionsExclusions';
import OrganizationCabTypes from '../component/pages/settings/Organization/CabTypes';
import OrganizationTourists from '../component/pages/settings/Organization/Tourists';
import AddUser from '../component/pages/settings/Organization/Invitemember';
import CreateAccountuser from '../component/Anyuserform/anyuserCreateAccount';
import Triplayout from '../component/pages/trips/Triplayout';
import DestinationForm from '../component/pages/settings/Organization/AdddestanitionForm';
import TripsourceForm from '../component/pages/settings/Organization/Tripsourceform';
import TripLayout from '../component/pages/trips/Triplayout';
import NewQuery from '../component/pages/trips/NewQuery';
import InProgress from '../component/pages/trips/InProgress';
import Converted from '../component/pages/trips/Converted';
import OnTrip from '../component/pages/trips/OnTrip';
import PastTrips from '../component/pages/trips/PastTrips';
import Canceled from '../component/pages/trips/Canceled';
import Dropped from '../component/pages/trips/Dropped';
import AddQuery from '../component/pages/trips/NewQuery';

 
 
 
const AppRoutes = () => {
  return (
    <Routes>
      {/* Default route to Login page */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
       
        <Route path="/carete-user/:email" element={<CreateAccountuser/>} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="Admin">
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/sales-person/dashboard"
        element={
          <ProtectedRoute role="Sales Person">
            <Layout>
              <SalesPersonDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Profile Section (All roles) */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute roles={['Admin', 'Sales Head', 'Sales Person', 'Operation Head', 'Reservation', 'Operation', 'Accountant', 'Data Operator', 'Reservation Head']}>
            <Layout>
            <ProfileSection/>
            </Layout>
          </ProtectedRoute>
        }
      >
 
        <Route path="password" element={<Password/>} /> 
        <Route path="security-logs" element={<SecurityLogs/>} />  
        <Route path="appearance" element={<Appearance/>} /> 
        
      </Route>

       <Route
       
       path='/organization'
       element={
        <ProtectedRoute roles={['Admin']}>   {/* adjust the roles */}
  <OrganizationLayout/>
        </ProtectedRoute>
       }
       >

       <Route path="repository" element={<OrganizationRepository/>} />
        <Route path="users" element={<OrganizationUsers/>} />
        <Route path="settings" element={<OrganizationSettings/>} />
        <Route path="destinations" element={<OrganizationDestinations/>} />
        <Route path="trip-sources" element={<OrganizationTripSources/>} />
        <Route path="email-templates" element={<OrganizationEmailTemplates/>} />
        <Route path="hotel-payment-prefs" element={<OrganizationHotelPaymentPrefs/>} />
        <Route path="terms-conditions" element={<OrganizationTermsConditions/>} />
        <Route path="inclusions-exclusions" element={<OrganizationInclusionsExclusions/>} />
        <Route path="cab-types" element={<OrganizationCabTypes/>} />
        <Route path="tourists" element={<OrganizationTourists/>} />
        <Route path="add-destination" element={<DestinationForm/>} />
         <Route path='tripsource-form' element={<TripsourceForm/>}/>
        <Route path="trips/new-query/add" element={<AddQuery/>} />
       </Route>



<Route path="/organization" element={<TripLayout/>}>
        <Route path="destinations" element={<div>Destinations Page</div>} />
        <Route path="trip-sources" element={<div>Trip Sources Page</div>} />
        <Route path="trips/new-query" element={<NewQuery/>} />
        <Route path="trips/in-progress" element={<InProgress/>} />
        <Route path="trips/converted" element={<Converted/>} />
        <Route path="trips/on-trip" element={<OnTrip/>} />
        <Route path="trips/past-trips" element={<PastTrips/>} />
        <Route path="trips/canceled" element={<Canceled/>} />
        <Route path="trips/dropped" element={<Dropped/>} />
      </Route>
         <Route  path='/trip' element={<ProtectedRoute roles={['Admin']}>


          <Triplayout/>
         </ProtectedRoute>
        }>
          



         </Route>






 <Route
        path="/adduser"
        element={
          <ProtectedRoute roles={['Admin', 'Sales Head', 'Sales Person', 'Operation Head', 'Reservation', 'Operation', 'Accountant', 'Data Operator', 'Reservation Head']}>
            <Layout>
     <AddUser/> 
            </Layout>
          </ProtectedRoute>
        }
      ></Route>
     
        
        
        
    </Routes>
  );
};

export default AppRoutes;