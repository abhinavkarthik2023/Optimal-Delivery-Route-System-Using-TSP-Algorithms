import React, { useState } from "react";
import {
  AppBar, Box, Toolbar, Typography, IconButton, Container, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Drawer, Modal, FormGroup,
  FormControlLabel, Checkbox, Grid, Button, Select, MenuItem, InputLabel,
  FormControl, OutlinedInput, Chip
} from "@mui/material";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PieController, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import MenuIcon from "@mui/icons-material/Menu";
import DirectionsIcon from "@mui/icons-material/Directions";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import Map from "./components/map";
import { nodes } from "./utils/constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,  
  PieController,
  Title,
  Tooltip,
  Legend
);

const barOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Algorithm Execution Times'
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    }
  }
};

const pieOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Distance Distribution by Algorithm'
    },
  }
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,  
  maxHeight: "90vh", 
  overflowY: "auto",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function App() {
  const [path, setPath] = useState([]);
  const [optimalPath, setOptimalPath] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [algorithm, setAlgorithm] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [executionData, setExecutionData] = useState([]);
  const [distanceData, setDistanceData] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const toggleNodeOnPath = (node, checked) => {
    const newPath = [...path];
    if (checked) {
      newPath.push({
        id: node.Location,
        lat: node.Latitude,
        lon: node.Longitude,
      });
    } else {
      const index = newPath.findIndex((pathNode) => pathNode.id === node.Location);
      if (index !== -1) {
        newPath.splice(index, 1);
      }
    }
    setPath(newPath);
  };

  const handleChangeAlgorithm = (event) => {
    const {
      target: { value },
    } = event;
    setAlgorithm(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const findOptimalRoute = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: path, algorithms: algorithm }),
    };
    const response = await fetch("http://localhost:5000/tsp/optimize_route", requestOptions)
      .then(res => res.json());

    if (response.length && response[0].optimized_route) {
      let bestResult = response[0];
      response.forEach(result => {
        if (result.total_distance < bestResult.total_distance) {
          bestResult = result;
        }
      });

      console.log(`Algorithm Selected: ${bestResult.algorithm}`);
      setSelectedAlgorithm(bestResult.algorithm);

      const target = bestResult.optimized_route.map(id => nodes.find(node => node.Location === id));

      setOptimalPath(target.filter(node => node).map(node => ({
        id: node.Location,
        lat: node.Latitude,
        lon: node.Longitude
      })));

      setTotalDistance(bestResult.total_distance * 0.621371);  // Convert km to miles for display
      setExecutionData(response.map(res => ({
        algorithm: res.algorithm,
        time: res.execution_time
      })));
      setDistanceData(response.map(res => ({
        algorithm: res.algorithm,
        distance: res.total_distance * 0.621371
      })));
    } else {
      console.error('No optimized routes received', response);
    }
  };

  return (
    <Container disableGutters maxWidth={false}>
      <Box sx={{ flexGrow: 1 }}>
      <AppBar color="primary">
  <Toolbar>
    <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={() => setIsDrawerOpen(true)}>
      <MenuIcon />
    </IconButton>
    <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
      Optimal Delivery Route System Using TSP Algorithms
    </Typography>
    {selectedAlgorithm && (
      <Typography sx={{ ml: 4 }} color="inherit">
        Chosen Algorithm: {selectedAlgorithm}
      </Typography>
    )}
    {optimalPath.length > 0 && (
      <Typography sx={{ ml: 4 }} color="inherit">
        Route: {optimalPath.map(node => node.id).join(' -> ')} | Total Distance: {totalDistance.toFixed(2)} miles
      </Typography>
    )}
    <IconButton color="inherit" onClick={() => setIsStatsModalOpen(true)} disabled={!executionData.length}>
      <Typography>Statistics</Typography>
    </IconButton>
    <Drawer
  anchor="left"
  open={isDrawerOpen}
  onClose={() => setIsDrawerOpen(false)}
>
  <Box
    sx={{ width: 250 }}
    role="presentation"
    onClick={() => setIsDrawerOpen(false)}
    onKeyDown={() => setIsDrawerOpen(false)}
  >
    <List>
      <ListItem disablePadding>
        <ListItemButton onClick={() => { setIsModalOpen(true); setIsDrawerOpen(false); }}>
          <ListItemIcon>
            <DirectionsIcon />
          </ListItemIcon>
          <ListItemText primary="Find Route" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton onClick={() => { setPath([]); setOptimalPath([]); setTotalDistance(0); setAlgorithm([]); setSelectedAlgorithm(''); setExecutionData([]); setDistanceData([]); setIsDrawerOpen(false); }}>
          <ListItemIcon>
            <RefreshIcon />
          </ListItemIcon>
          <ListItemText primary="Clear Route" />
        </ListItemButton>
      </ListItem>
    </List>
  </Box>
</Drawer>


  </Toolbar>
</AppBar>

        <Map path={optimalPath} />
        <Modal
          open={isStatsModalOpen}
          onClose={() => setIsStatsModalOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Statistics and Insights
            </Typography>
            <Bar data={{
              labels: executionData.map(data => data.algorithm),
              datasets: [{
                label: 'Execution Time (seconds)',
                data: executionData.map(data => data.time),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
              }]
            }} options={barOptions} />
            <Pie data={{
              labels: distanceData.map(data => data.algorithm),
              datasets: [{
                label: 'Distance (miles)',
                data: distanceData.map(data => data.distance),
                backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                ],
                borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
              }]
            }} options={pieOptions} />
            <Typography sx={{ mt: 2 }}>
              Recommendation: Based on the current data, {selectedAlgorithm} seems to be the most effective for minimizing travel distance.
            </Typography>
            <Button onClick={() => setIsStatsModalOpen(false)} sx={{ mt: 2 }}>
              Close
            </Button>
          </Box>
        </Modal>
      </Box>
       
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Select Locations and Algorithm
          </Typography>
          <FormControl fullWidth sx={{ m: 1 }}>
            <InputLabel id="algorithm-select-label">Algorithm</InputLabel>
            <Select
              labelId="algorithm-select-label"
              id="algorithm-select"
              multiple
              value={algorithm}
              onChange={handleChangeAlgorithm}
              input={<OutlinedInput id="select-multiple-chip" label="Algorithm" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="brute_force">Brute Force</MenuItem>
              <MenuItem value="genetic">Genetic Algorithm</MenuItem>
              <MenuItem value="nearest_neighbor">Nearest Neighbor</MenuItem>
              <MenuItem value="simulated_annealing">Simulated Annealing</MenuItem>
              <MenuItem value="branch_and_bound">Branch and Bound</MenuItem>
            </Select>
          </FormControl>
          <FormGroup>
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              {nodes.map((node) => (
                <Grid item key={node.Location} xs={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={path.some(p => p.id === node.Location)}
                        onChange={(event) => toggleNodeOnPath(node, event.target.checked)}
                      />
                    }
                    label={node.Location}
                  />
                </Grid>
              ))}
            </Grid>
          </FormGroup>
          <Button
            variant="contained"
            onClick={() => {
              setIsModalOpen(false);
              findOptimalRoute();
            }}
            sx={{ mt: 2 }}
          >
            Find The Most Optimal Route
          </Button>
          <Button onClick={() => setIsModalOpen(false)} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </Container>
  );
}
