'use client'
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { User } from '../../interfaces/User/IUser';

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
      className="w-full"
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, width: '100%' }}>
          {children}
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
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

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

    const handleChangePage = (event: unknown, newPage: number) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
    };

    return (
        <>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
                Usuarios y Perfiles
            </Typography>
            <Paper elevation={3} sx={{ borderRadius: '10px', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', height: 'auto', minHeight: '500px' }}>
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={value}
                        onChange={handleChange}
                        aria-label="Pestañas de usuarios y perfiles"
                        sx={{
                            borderRight: 1,
                            borderColor: 'divider',
                            minWidth: '200px',
                            '& .MuiTab-root': {
                                alignItems: 'flex-start',
                                textAlign: 'left',
                                pl: 3,
                                py: 2
                            },
                            '& .Mui-selected': {
                                color: 'primary.main',
                                fontWeight: 'bold',
                                backgroundColor: 'rgba(25, 118, 210, 0.08)'
                            }
                        }}
                    >
                        <Tab 
                            label="Usuarios" 
                            {...a11yProps(0)} 
                            sx={{ fontSize: '1rem' }} 
                        />
                        <Tab 
                            label="Perfiles" 
                            {...a11yProps(1)} 
                            sx={{ fontSize: '1rem' }} 
                        />
                    </Tabs>
                    <TabPanel value={value} index={0}>
                        <Paper elevation={0} sx={{ width: '100%' }}>
                            <TableContainer>
                                <Table sx={{ minWidth: 650 }} aria-label="tabla de usuarios">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Usuario</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Rol</TableCell>
                                            <TableCell>Estado</TableCell>
                                            <TableCell>Creado</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((user) => (
                                                <TableRow
                                                    key={user.id}
                                                    sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                                                >
                                                    <TableCell>{user.id}</TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Avatar sx={{ width: 32, height: 32, bgcolor: user.roleId === 1 ? 'primary.main' : 'secondary.main' }}>
                                                                {user.name.charAt(0)}
                                                            </Avatar>
                                                            {user.name}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={user.roleId === 1 ? "Admin" : "Usuario"}
                                                            color={user.roleId === 1 ? "primary" : "default"}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={user.enabled ? "Activo" : "Inactivo"}
                                                            color={user.enabled ? "success" : "error"}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.createdAt.toLocaleDateString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={users.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="Filas por página:"
                            />
                        </Paper>
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <Box sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Gestión de Perfiles</Typography>
                            <Typography variant="body1" color="text.secondary">
                                Esta sección está en desarrollo. Aquí podrás gestionar los perfiles y roles de usuarios.
                            </Typography>
                        </Box>
                    </TabPanel>
                </Box>
            </Paper>
        </>
    );
}

export default UsersProfiles;
