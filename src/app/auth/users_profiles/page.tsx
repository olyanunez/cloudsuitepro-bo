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
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import { User } from '../../interfaces/User/IUser';
import { UserService } from '../../services/userService';

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
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Usamos un estado para controlar si estamos en el cliente
    const [isMounted, setIsMounted] = React.useState(false);
    
    // Función para cargar usuarios desde el servicio
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await UserService.getUsers();
        setUsers(data);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
        setError('No se pudieron cargar los usuarios. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    React.useEffect(() => {
      setIsMounted(true);
      
      // Solo cargamos los datos cuando el componente está montado en el cliente
      if (isMounted) {
        loadUsers();
      }
    }, [isMounted]);

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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: 0 }}>
                    Usuarios y Perfiles
                </Typography>
                <Button 
                    variant="outlined" 
                    color="primary" 
                    startIcon={<RefreshIcon />}
                    onClick={loadUsers}
                    disabled={loading}
                >
                    {loading ? 'Cargando...' : 'Actualizar'}
                </Button>
            </Box>
            <Paper elevation={3} sx={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(144, 12, 63, 0.15)' }}>
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
                            backgroundColor: 'rgba(144, 12, 63, 0.05)',
                            '& .MuiTab-root': {
                                alignItems: 'flex-start',
                                textAlign: 'left',
                                pl: 3,
                                py: 2,
                            },
                            '& .Mui-selected': {
                                color: '#900C3F !important',
                                fontWeight: 'bold',
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#C70039',
                                width: '4px',
                            },
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
                        <Paper elevation={1} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4, minHeight: '300px' }}>
                                    <CircularProgress />
                                    <Typography variant="body1" sx={{ ml: 2 }}>Cargando usuarios...</Typography>
                                </Box>
                            ) : error ? (
                                <Box sx={{ p: 4, textAlign: 'center', color: 'error.main', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant="body1">{error}</Typography>
                                </Box>
                            ) : users.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant="body1">No hay usuarios disponibles.</Typography>
                                </Box>
                            ) : (
                                <>
                                    <TableContainer>
                                        <Table sx={{ minWidth: 650 }} aria-label="tabla de usuarios">
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: 'rgba(144, 12, 63, 0.1)' }}>
                                                    <TableCell>ID</TableCell>
                                                    <TableCell>Nombre</TableCell>
                                                    <TableCell>Email</TableCell>
                                                    <TableCell>Rol</TableCell>
                                                    <TableCell>Estado</TableCell>
                                                    <TableCell>Fecha Creación</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {users
                                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                    .map((user) => (
                                                        <TableRow
                                                            key={user.id}
                                                            sx={{ '&:hover': { backgroundColor: 'rgba(144, 12, 63, 0.05)' } }}
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
                                                                {isMounted && typeof user.createdAt === 'string' 
                                                                    ? new Date(user.createdAt).toLocaleDateString() 
                                                                    : typeof user.createdAt === 'object' 
                                                                        ? user.createdAt.toLocaleDateString() 
                                                                        : '01/01/2023'}
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
                                </>
                            )}
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
