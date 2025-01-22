export interface RequestBody {
  startX: string;
  startY: string;
  endX: string;
  endY: string;
}

export interface ResponseBody {
  type: 'FeatureCollection';
  features: [
    {
      type: 'Feature';
      properties: {
        totalDistance: number;
        totalTime: number;
        totalFare: number;
        taxiFare: number;
      };
    },
  ];
}

export interface ErrorResponseBody {
  error: {
    id: string;
    category: string;
    code: string;
    message: string;
  };
}

export interface DestinationDepartureLocation {
  id: number;
  departure: { x: number; y: number };
  destination: { x: number; y: number };
}
