import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertyAPI } from '../api/propertyService';
import PropertyCard from '../components/PropertyCard';
import Loader from '../components/Loader';
import { Search, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    listingType: searchParams.get('listingType') || '',
    type: searchParams.get('type') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
  });

  useEffect(() => {
    fetchProperties();
  }, [searchParams]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(searchParams).toString();
      const response = await propertyAPI.search(queryParams);
      setProperties(response.data.data.properties);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    );
    setSearchParams(cleanFilters);
  };

  const propertyTypes = ['APARTMENT', 'VILLA', 'HOUSE', 'STUDIO', 'PG', 'CONDO', 'TOWNHOUSE'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card bg-white mb-8">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              name="city"
              placeholder="Enter City or Locality"
              value={filters.city}
              onChange={handleFilterChange}
              className="input-field"
            />
            <select name="listingType" value={filters.listingType} onChange={handleFilterChange} className="input-field">
              <option value="">For Rent/Sale</option>
              <option value="RENT">For Rent</option>
              <option value="SALE">For Sale</option>
            </select>
            <select name="type" value={filters.type} onChange={handleFilterChange} className="input-field">
              <option value="">All Property Types</option>
              {propertyTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>
              ))}
            </select>
            <input
              type="number"
              name="bedrooms"
              placeholder="Bedrooms (Any)"
              value={filters.bedrooms}
              onChange={handleFilterChange}
              className="input-field"
              min="0"
            />
            <input
              type="number"
              name="bathrooms"
              placeholder="Bathrooms (Any)"
              value={filters.bathrooms}
              onChange={handleFilterChange}
              className="input-field"
              min="0"
            />
            <input
              type="number"
              name="priceMin"
              placeholder="Min. Price (₹)"
              value={filters.priceMin}
              onChange={handleFilterChange}
              className="input-field"
              min="0"
            />
            <input
              type="number"
              name="priceMax"
              placeholder="Max. Price (₹)"
              value={filters.priceMax}
              onChange={handleFilterChange}
              className="input-field"
              min="0"
            />
            <button type="submit" className="btn-primary w-full md:col-start-4">
              <Search className="mr-2 h-5 w-5" />
              Search
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <Loader />
      ) : properties.length > 0 ? (
        <>
          <p className="text-gray-600 mb-4">{pagination.totalItems || 0} properties found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 card bg-white">
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Properties Found</h3>
          <p className="text-gray-500">
            Try adjusting your search filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default Properties;
