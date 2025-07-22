import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../component/Layout";
import Login from "../component/pages/auth/Login";

import AdminDashboard from "../component/pages/Dashboard/AdminDashboard";
import SalesPersonDashboard from "../component/pages/Dashboard/SalesPersonDashboard";

import Password from "../component/pages/settings/Profile/Password";
import Appearance from "../component/pages/settings/Profile/Apperance";
import SecurityLogs from "../component/pages/settings/Profile/Security";
import ProfileSection from "../component/pages/settings/Profile/Profile";
import OrganizationLayout from "../component/pages/settings/Organization/Organizationlayut";
import OrganizationRepository from "../component/pages/settings/Organization/Repository";
import OrganizationUsers from "../component/pages/settings/Organization/User";
import OrganizationSettings from "../component/pages/settings/Organization/Setting";
import OrganizationDestinations from "../component/pages/settings/Organization/Destinations";
import OrganizationTripSources from "../component/pages/settings/Organization/TripSource";
import OrganizationEmailTemplates from "../component/pages/settings/Organization/EmailTemplates";
import OrganizationHotelPaymentPrefs from "../component/pages/settings/Organization/HotelPaymentPrefs";
import OrganizationTermsConditions from "../component/pages/settings/Organization/TermConditions";
import OrganizationInclusionsExclusions from "../component/pages/settings/Organization/InclusionsExclusions";
import OrganizationCabTypes from "../component/pages/settings/Organization/CabTypes";
import OrganizationTourists from "../component/pages/settings/Organization/Tourists";
import AddUser from "../component/pages/settings/Organization/Invitemember";
import CreateAccountuser from "../component/Anyuserform/anyuserCreateAccount";
import Triplayout from "../component/pages/trips/Triplayout";
import DestinationForm from "../component/pages/settings/Organization/AdddestanitionForm";
import TripsourceForm from "../component/pages/settings/Organization/Tripsourceform";
import TripLayout from "../component/pages/trips/Triplayout";
import NewQuery from "../component/pages/trips/NewQuery";
import InProgress from "../component/pages/trips/InProgress";
import Converted from "../component/pages/trips/Converted";
import OnTrip from "../component/pages/trips/OnTrip";
import PastTrips from "../component/pages/trips/PastTrips";
import Canceled from "../component/pages/trips/Canceled";
import Dropped from "../component/pages/trips/Dropped";
import AddQuery from "../component/pages/trips/NewQuery";
import NewQueryList from "../component/pages/trips/NewQueryList";
import QueryDetailModal from "../component/pages/trips/QueryDetailModal";
import Hotel from "../component/pages/Hotels/Hotel";
import AddHotel from "../component/pages/Hotels/AddHotel";
import ViewHotel from "../component/pages/Hotels/ViewHotel";
import EditHotel from "../component/pages/Hotels/EditHotel";
import TransportServices from "../component/pages/transport/TransportServices";
import AddTransportService from "../component/pages/transport/AddTransportService";
import CsvUploader from "../component/pages/Hotels/HotelPrice";
import NewQuote from "../component/pages/trips/new-quote/NewQuote";
import EditTransportService from "../component/pages/transport/EditTransportService";
const AppRoutes = () => {
  return (
    <Routes>
      {/* Default route to Login page */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      <Route path="/carete-user/:email" element={<CreateAccountuser />} />

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
        path="/hotels"
        element={
          <ProtectedRoute
            roles={[
              "Admin",
              "Sales Head",
              "Sales Person",
              "Operation Head",
              "Reservation",
              "Operation",
              "Accountant",
              "Data Operator",
              "Reservation Head",
            ]}
          >
            <Layout>
              <Hotel />
            </Layout>
          </ProtectedRoute>
        }
      >
        
      </Route>
      <Route
        path="/addhotel"
        element={
          <ProtectedRoute
            roles={[
              "Admin",
              "Sales Head",
              "Sales Person",
              "Operation Head",
              "Reservation",
              "Operation",
              "Accountant",
              "Data Operator",
              "Reservation Head",
            ]}
          >
            <Layout>
              <AddHotel />
            </Layout>
          </ProtectedRoute>
        }
      >
        
      </Route>
      <Route
        path="/hotels/:id"
        element={
          <ProtectedRoute
            roles={[
              "Admin",
              "Sales Head",
              "Sales Person",
              "Operation Head",
              "Reservation",
              "Operation",
              "Accountant",
              "Data Operator",
              "Reservation Head",
            ]}
          >
            <Layout>
              <ViewHotel />
            </Layout>
          </ProtectedRoute>
        }
      >
        
      </Route>
      <Route
        path="/hotels/edit/:id"
        element={
          <ProtectedRoute
            roles={[
              "Admin",
              "Sales Head",
              "Sales Person",
              "Operation Head",
              "Reservation",
              "Operation",
              "Accountant",
              "Data Operator",
              "Reservation Head",
            ]}
          >
            <Layout>
              <EditHotel />
            </Layout>
          </ProtectedRoute>
        }
      >
      </Route>
      <Route
        path="/hotel-price"
        element={
          <ProtectedRoute
            roles={[
              "Admin",
              "Sales Head",
              "Sales Person",
              "Operation Head",
              "Reservation",
              "Operation",
              "Accountant",
              "Data Operator",
              "Reservation Head",
            ]}
          >
            <Layout>
              <CsvUploader />
            </Layout>
          </ProtectedRoute>
        }
      >
      </Route>

      <Route
        path="/new-quote"
        element={
          <ProtectedRoute
            roles={[
              "Admin",
              "Sales Head",
              "Sales Person",
              "Operation Head",
              "Reservation",
              "Operation",
              "Accountant",
              "Data Operator",
              "Reservation Head",
            ]}
          >
            <Layout>
              <NewQuote />
            </Layout>
          </ProtectedRoute>
        }
      >
      </Route>



      <Route
        path="transport-Service"
        element={
          <ProtectedRoute
            roles={[
              "Admin",
              "Sales Head",
              "Sales Person",
              "Operation Head",
              "Reservation",
              "Operation",
              "Accountant",
              "Data Operator",
              "Reservation Head",
            ]}
          >
            <Layout>
              <TransportServices />
            </Layout>
          </ProtectedRoute>
        }
      >
      </Route>
      
    <Route
        path="/addservice"
        element={
          <ProtectedRoute
            roles={[
              "Admin",
              "Sales Head",
              "Sales Person",
              "Operation Head",
              "Reservation",
              "Operation",
              "Accountant",
              "Data Operator",
              "Reservation Head",
            ]}
          >
            <Layout>
              <AddTransportService />
            </Layout>
          </ProtectedRoute>
        }
      >
        
      </Route>
      
<Route
        path="/service/update/:id"
        element={
          <ProtectedRoute
            roles={[
              "Admin",
              "Sales Head",
              "Sales Person",
              "Operation Head",
              "Reservation",
              "Operation",
              "Accountant",
              "Data Operator",
              "Reservation Head",
            ]}
          >
            <Layout>
              <EditTransportService />
            </Layout>
          </ProtectedRoute>
        }
      >
      </Route>

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
          <ProtectedRoute
            roles={[
              "Admin",
              "Sales Head",
              "Sales Person",
              "Operation Head",
              "Reservation",
              "Operation",
              "Accountant",
              "Data Operator",
              "Reservation Head",
            ]}
          >
            <Layout>
              <ProfileSection />
            </Layout>
          </ProtectedRoute>
        }
      >
        <Route path="password" element={<Password />} />
        <Route path="security-logs" element={<SecurityLogs />} />
        <Route path="appearance" element={<Appearance />} />
      </Route>

      <Route
        path="/organization"
        element={
          <ProtectedRoute roles={["Admin"]}>
            {" "}
            {/* adjust the roles */}
            <OrganizationLayout />
          </ProtectedRoute>
        }
      >
        <Route path="repository" element={<OrganizationRepository />} />
        <Route path="users" element={<OrganizationUsers />} />
        <Route path="settings" element={<OrganizationSettings />} />
        <Route path="destinations" element={<OrganizationDestinations />} />
        <Route path="trip-sources" element={<OrganizationTripSources />} />
        <Route
          path="email-templates"
          element={<OrganizationEmailTemplates />}
        />
        <Route
          path="hotel-payment-prefs"
          element={<OrganizationHotelPaymentPrefs />}
        />
        <Route
          path="terms-conditions"
          element={<OrganizationTermsConditions />}
        />
        <Route
          path="inclusions-exclusions"
          element={<OrganizationInclusionsExclusions />}
        />
        <Route path="cab-types" element={<OrganizationCabTypes />} />
        <Route path="tourists" element={<OrganizationTourists />} />
        <Route path="add-destination" element={<DestinationForm />} />
        <Route path="tripsource-form" element={<TripsourceForm />} />
        <Route path="trips/new-query/add" element={<AddQuery />} />
      </Route>

      <Route path="/organization" element={<TripLayout />}>
        <Route path="destinations" element={<div>Destinations Page</div>} />
        <Route path="trip-sources" element={<div>Trip Sources Page</div>} />
        <Route path="trips/new-query" element={<NewQuery />} />
        <Route path="trips/in-progress" element={<InProgress />} />
        <Route path="trips/converted" element={<Converted />} />
        <Route path="trips/on-trip" element={<OnTrip />} />
        <Route path="trips/past-trips" element={<PastTrips />} />
        <Route path="trips/canceled" element={<Canceled />} />
        <Route path="trips/dropped" element={<Dropped />} />
        <Route path="trips/new-query-list" element={<NewQueryList />} />
        <Route path="trips/query/:id" element={<QueryDetailModal />} />
      </Route>

      <Route
        path="/trip"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <Triplayout />
          </ProtectedRoute>
        }
      ></Route>

      <Route
        path="/adduser"
        element={
          <ProtectedRoute
            roles={[
              "Admin",
              "Sales Head",
              "Sales Person",
              "Operation Head",
              "Reservation",
              "Operation",
              "Accountant",
              "Data Operator",
              "Reservation Head",
            ]}
          >
            <Layout>
              <AddUser />
            </Layout>
          </ProtectedRoute>
        }
      ></Route>
    </Routes>
  );
};

export default AppRoutes;
