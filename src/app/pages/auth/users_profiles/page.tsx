'use client'
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { User } from '../../../interfaces/User/IUser';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const UsersProfiles = () => {
    const [value, setValue] = React.useState(0);
    const [users, setUsers] = React.useState<User[]>([]);
    
    React.useEffect(() => {
      // Generar usuarios solo en el lado del cliente
      const generatedUsers = Array.from({ length: 50 }, (_, index) => ({
        id: index + 1,
        name: `User${index + 1}`,
        password: `password${index + 1}`,
        email: `user${index + 1}@example.com`,
        roleId: index % 5 === 0 ? 1 : 2, // Alterna roles entre 1 y 2
        // role: index % 5 === 0 ? { id: 1, name: "Admin" } : { id: 2, name: "User" },
        wasActivated: Math.random() > 0.3, // 70% de los usuarios están activados
        enabled: Math.random() > 0.2, // 80% de los usuarios están habilitados
        createdAt: new Date(),
        modifiedAt: new Date(),
        createdById: index > 0 ? 1 : undefined, // Asigna el primer usuario como creador de los demás
        createdBy: index > 0 ? { id: 1, name: "SuperAdmin", password: "admin123", email: "admin@example.com", wasActivated: true, enabled: true, createdAt: new Date(), modifiedAt: new Date() } : undefined,
        updatedById: index > 0 ? 1 : undefined,
        updatedBy: index > 0 ? { id: 1, name: "SuperAdmin", password: "admin123", email: "admin@example.com", wasActivated: true, enabled: true, createdAt: new Date(), modifiedAt: new Date() } : undefined,
      }));
      setUsers(generatedUsers);
    }, []);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
    };

    return (
        <>
            <h3>Usuarios y Perfiles</h3>
            <Box
                sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 224 }}
            >
                <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={value}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                    // sx={{ borderRight: 1, borderColor: 'divider' }}
                >
                    <Tab label="Usuarios" {...a11yProps(0)} />
                    <Tab label="Perfiles" {...a11yProps(1)} />
                </Tabs>
                <TabPanel value={value} index={0}>
                  <div className='bg-red-500 '>
                    {
                      users.map((e, i) =>{
                        return<div key={"table-item"+i} className='bg-white'>
                          <span className='text-red-800'>{e.name}</span>
                            <div>
                              <span className='text-red-800'>Nombre</span>
                            </div>
                        </div>;
                      })
                    }
                  </div>
                </TabPanel>
                <TabPanel value={value} index={1}>
                    Item Two
                </TabPanel>
            </Box>
        </>
    );
}

export default UsersProfiles;