import { NextResponse } from 'next/server';

const NETWORKS = ['Rompetrol', 'Lukoil', 'Bemol', 'TLX', 'Avante', 'Vento', 'Petrom', 'NOW OIL'] as const;

type StationRecord = {
  station_name?: string | null;
  gasoline?: number | null;
  diesel?: number | null;
};

type FuelNetworkAverage = {
  network: string;
  gasoline: number | null;
  diesel: number | null;
  stations: number;
};

function normalizeName(value?: string | null) {
  return value?.toUpperCase().trim() ?? '';
}

function matchesNetwork(stationName: string | null | undefined, network: string) {
  return normalizeName(stationName).includes(network.toUpperCase());
}

export async function GET() {
  const response = await fetch('https://api.ecarburanti.anre.md/public/', {
    cache: 'no-store'
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Unable to fetch fuel data from ANRE.' }, { status: 502 });
  }

  const data = (await response.json()) as StationRecord[];

  const result: FuelNetworkAverage[] = NETWORKS.map((network) => {
    const stations = data.filter((station) => matchesNetwork(station.station_name, network));
    const gasolineValues = stations
      .map((station) => station.gasoline)
      .filter((value): value is number => typeof value === 'number' && !Number.isNaN(value));
    const dieselValues = stations
      .map((station) => station.diesel)
      .filter((value): value is number => typeof value === 'number' && !Number.isNaN(value));

    const gasoline = gasolineValues.length > 0
      ? gasolineValues.reduce((sum, current) => sum + current, 0) / gasolineValues.length
      : null;

    const diesel = dieselValues.length > 0
      ? dieselValues.reduce((sum, current) => sum + current, 0) / dieselValues.length
      : null;

    return {
      network,
      gasoline,
      diesel,
      stations: stations.length
    };
  });

  return NextResponse.json({ data: result });
}
