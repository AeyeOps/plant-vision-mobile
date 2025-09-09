import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import type { Inspection } from '../lib/db';
import { InspectionForm } from '../components/InspectionForm';
const InspectionsPage: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);

  useEffect(() => {
    // Load inspections when component mounts
    const loadInspections = async () => {
      const loadedInspections = await db.getAllInspections();
      setInspections(loadedInspections);
    };

    loadInspections();
  }, []);

  const renderInspectionCard = (item: Inspection) => (
    <div className="bg-card text-card-foreground p-4 my-2 rounded-lg shadow-md border">
      <h3 className="font-bold text-lg">
        {item.tagName}
      </h3>
      <p>
        Status: {item.status}
      </p>
      <p>
        Timestamp: {item.timestamp.toLocaleString()}
      </p>
      {item.photos && item.photos.length > 0 && (
        <div>
          <p>Photos:</p>
          <div className="flex gap-2">
            {item.photos.map((photoUri, index) => (
              <img 
                key={index} 
                src={photoUri} 
                alt={`Inspection photo ${index + 1}`}
                className="w-24 h-24 object-cover rounded" 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const handleNewInspection = (newInspection: Inspection) => {
    setInspections([...inspections, newInspection]);
  };

  return (
    <div className="flex-1 p-4">
      <h1 className="text-2xl font-bold mb-4" style={{ color: '#4682b4' }}>
        Inspections
      </h1>

      <InspectionForm onInspectionCreated={handleNewInspection} />

      <div className="mt-4">
        {inspections.length === 0 ? (
          <div className="text-center mt-12">
            <p>No inspections yet. Create your first inspection!</p>
          </div>
        ) : (
          inspections.map((item) => (
            <div key={item.uuid}>
              {renderInspectionCard(item)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InspectionsPage;