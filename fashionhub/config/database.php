<?php
/**
 * Database.php - Clase para gestión de base de datos FashionHub
 * Conexión MySQL con PDO y operaciones CRUD completas
 */

class Database {
    // Configuración de conexión
    private $host = "localhost";
    private $db_name = "fashionhub";
    private $username = "root";
    private $password = "";
    private $port = "3306";
    public $conn;

    // Constructor
    public function __construct() {
        $this->connect();
    }

    // Método de conexión
    public function connect() {
        $this->conn = null;
        
        try {
            $dsn = "mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            
            $this->conn = new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_PERSISTENT => true
            ]);
            
            //echo "✅ Conexión a MySQL exitosa<br>";
            
        } catch(PDOException $exception) {
            echo "❌ Error de conexión: " . $exception->getMessage() . "<br>";
            error_log("Database Error: " . $exception->getMessage());
        }
        
        return $this->conn;
    }

    // Método para obtener la conexión
    public function getConnection() {
        if ($this->conn === null) {
            $this->connect();
        }
        return $this->conn;
    }

    // ==================== OPERACIONES DE PRODUCTOS ====================

    /**
     * Obtener todos los productos con filtros opcionales
     */
    public function getProductos($filtros = []) {
        $conn = $this->getConnection();
        
        $sql = "SELECT p.*, c.nombre as categoria_nombre 
                FROM productos p 
                LEFT JOIN categorias c ON p.categoria_id = c.id 
                WHERE 1=1";
        
        $params = [];
        
        // Aplicar filtros
        if (!empty($filtros['categoria_id'])) {
            $sql .= " AND p.categoria_id = ?";
            $params[] = $filtros['categoria_id'];
        }
        
        if (!empty($filtros['busqueda'])) {
            $sql .= " AND (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.tags LIKE ?)";
            $searchTerm = "%" . $filtros['busqueda'] . "%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        if (!empty($filtros['precio_min'])) {
            $sql .= " AND p.precio >= ?";
            $params[] = $filtros['precio_min'];
        }
        
        if (!empty($filtros['precio_max'])) {
            $sql .= " AND p.precio <= ?";
            $params[] = $filtros['precio_max'];
        }
        
        if (!empty($filtros['en_stock'])) {
            $sql .= " AND p.stock > 0";
        }
        
        // Ordenamiento
        $orden = "p.fecha_creacion DESC";
        if (!empty($filtros['orden'])) {
            switch($filtros['orden']) {
                case 'precio_asc':
                    $orden = "p.precio ASC";
                    break;
                case 'precio_desc':
                    $orden = "p.precio DESC";
                    break;
                case 'nombre_asc':
                    $orden = "p.nombre ASC";
                    break;
                case 'nombre_desc':
                    $orden = "p.nombre DESC";
                    break;
                case 'popularidad':
                    $orden = "p.ventas DESC";
                    break;
            }
        }
        $sql .= " ORDER BY " . $orden;
        
        // Paginación
        if (!empty($filtros['limite'])) {
            $sql .= " LIMIT ?";
            $params[] = (int)$filtros['limite'];
            
            if (!empty($filtros['offset'])) {
                $sql .= " OFFSET ?";
                $params[] = (int)$filtros['offset'];
            }
        }
        
        try {
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
            
        } catch(PDOException $e) {
            error_log("Error getProductos: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtener un producto por ID
     */
    public function getProductoById($id) {
        $conn = $this->getConnection();
        
        $sql = "SELECT p.*, c.nombre as categoria_nombre 
                FROM productos p 
                LEFT JOIN categorias c ON p.categoria_id = c.id 
                WHERE p.id = ?";
        
        try {
            $stmt = $conn->prepare($sql);
            $stmt->execute([$id]);
            return $stmt->fetch();
            
        } catch(PDOException $e) {
            error_log("Error getProductoById: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtener productos relacionados
     */
    public function getProductosRelacionados($producto_id, $categoria_id, $limite = 4) {
        $conn = $this->getConnection();
        
        $sql = "SELECT p.*, c.nombre as categoria_nombre 
                FROM productos p 
                LEFT JOIN categorias c ON p.categoria_id = c.id 
                WHERE p.categoria_id = ? AND p.id != ? AND p.estado = 'activo' 
                ORDER BY p.ventas DESC, p.fecha_creacion DESC 
                LIMIT ?";
        
        try {
            $stmt = $conn->prepare($sql);
            $stmt->execute([$categoria_id, $producto_id, $limite]);
            return $stmt->fetchAll();
            
        } catch(PDOException $e) {
            error_log("Error getProductosRelacionados: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Buscar productos por término
     */
    public function buscarProductos($termino) {
        $conn = $this->getConnection();
        
        $sql = "SELECT p.*, c.nombre as categoria_nombre 
                FROM productos p 
                LEFT JOIN categorias c ON p.categoria_id = c.id 
                WHERE (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.tags LIKE ? OR c.nombre LIKE ?)
                AND p.estado = 'activo' 
                ORDER BY 
                    CASE 
                        WHEN p.nombre LIKE ? THEN 1
                        WHEN p.tags LIKE ? THEN 2
                        ELSE 3
                    END,
                    p.ventas DESC";
        
        $searchTerm = "%" . $termino . "%";
        $params = array_fill(0, 6, $searchTerm);
        
        try {
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
            
        } catch(PDOException $e) {
            error_log("Error buscarProductos: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Actualizar stock de producto
     */
    public function actualizarStock($producto_id, $cantidad) {
        $conn = $this->getConnection();
        
        $sql = "UPDATE productos SET stock = stock - ?, ventas = ventas + ? WHERE id = ? AND stock >= ?";
        
        try {
            $stmt = $conn->prepare($sql);
            return $stmt->execute([$cantidad, $cantidad, $producto_id, $cantidad]);
            
        } catch(PDOException $e) {
            error_log("Error actualizarStock: " . $e->getMessage());
            return false;
        }
    }

    // ==================== OPERACIONES DE USUARIOS ====================

    /**
     * Registrar nuevo usuario
     */
    public function registrarUsuario($datos) {
        $conn = $this->getConnection();
        
        $sql = "INSERT INTO usuarios (nombre, email, password, telefono, direccion, ciudad, fecha_registro) 
                VALUES (?, ?, ?, ?, ?, ?, NOW())";
        
        try {
            // Verificar si el email ya existe
            if ($this->emailExiste($datos['email'])) {
                return ['success' => false, 'message' => 'El email ya está registrado'];
            }
            
            $password_hash = password_hash($datos['password'], PASSWORD_DEFAULT);
            
            $stmt = $conn->prepare($sql);
            $success = $stmt->execute([
                $datos['nombre'],
                $datos['email'],
                $password_hash,
                $datos['telefono'] ?? null,
                $datos['direccion'] ?? null,
                $datos['ciudad'] ?? null
            ]);
            
            if ($success) {
                return [
                    'success' => true, 
                    'user_id' => $conn->lastInsertId(),
                    'message' => 'Usuario registrado exitosamente'
                ];
            } else {
                return ['success' => false, 'message' => 'Error al registrar usuario'];
            }
            
        } catch(PDOException $e) {
            error_log("Error registrarUsuario: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error del sistema'];
        }
    }

    /**
     * Verificar login de usuario
     */
    public function verificarLogin($email, $password) {
        $conn = $this->getConnection();
        
        $sql = "SELECT id, nombre, email, password, telefono, direccion, ciudad, fecha_registro 
                FROM usuarios WHERE email = ? AND estado = 'activo'";
        
        try {
            $stmt = $conn->prepare($sql);
            $stmt->execute([$email]);
            $usuario = $stmt->fetch();
            
            if ($usuario && password_verify($password, $usuario['password'])) {
                // Remover password del resultado
                unset($usuario['password']);
                return $usuario;
            }
            
            return false;
            
        } catch(PDOException $e) {
            error_log("Error verificarLogin: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Verificar si email existe
     */
    public function emailExiste($email) {
        $conn = $this->getConnection();
        
        $sql = "SELECT id FROM usuarios WHERE email = ?";
        
        try {
            $stmt = $conn->prepare($sql);
            $stmt->execute([$email]);
            return $stmt->fetch() !== false;
            
        } catch(PDOException $e) {
            error_log("Error emailExiste: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtener usuario por ID
     */
    public function getUsuarioById($id) {
        $conn = $this->getConnection();
        
        $sql = "SELECT id, nombre, email, telefono, direccion, ciudad, fecha_registro 
                FROM usuarios WHERE id = ? AND estado = 'activo'";
        
        try {
            $stmt = $conn->prepare($sql);
            $stmt->execute([$id]);
            return $stmt->fetch();
            
        } catch(PDOException $e) {
            error_log("Error getUsuarioById: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Actualizar perfil de usuario
     */
    public function actualizarPerfil($usuario_id, $datos) {
        $conn = $this->getConnection();
        
        $sql = "UPDATE usuarios SET nombre = ?, telefono = ?, direccion = ?, ciudad = ? WHERE id = ?";
        
        try {
            $stmt = $conn->prepare($sql);
            return $stmt->execute([
                $datos['nombre'],
                $datos['telefono'],
                $datos['direccion'],
                $datos['ciudad'],
                $usuario_id
            ]);
            
        } catch(PDOException $e) {
            error_log("Error actualizarPerfil: " . $e->getMessage());
            return false;
        }
    }

    // ==================== OPERACIONES DE PEDIDOS ====================

    /**
     * Crear nuevo pedido
     */
    public function crearPedido($pedido_data) {
        $conn = $this->getConnection();
        
        try {
            $conn->beginTransaction();
            
            // 1. Insertar pedido
            $sql_pedido = "INSERT INTO pedidos (usuario_id, total, subtotal, envio, impuestos, direccion_envio, ciudad_envio, telefono_contacto, estado, fecha_pedido) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', NOW())";
            
            $stmt_pedido = $conn->prepare($sql_pedido);
            $stmt_pedido->execute([
                $pedido_data['usuario_id'],
                $pedido_data['total'],
                $pedido_data['subtotal'],
                $pedido_data['envio'],
                $pedido_data['impuestos'],
                $pedido_data['direccion_envio'],
                $pedido_data['ciudad_envio'],
                $pedido_data['telefono_contacto']
            ]);
            
            $pedido_id = $conn->lastInsertId();
            
            // 2. Insertar items del pedido y actualizar stock
            $sql_item = "INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario, subtotal) 
                        VALUES (?, ?, ?, ?, ?)";
            
            $stmt_item = $conn->prepare($sql_item);
            
            foreach ($pedido_data['items'] as $item) {
                // Insertar item
                $stmt_item->execute([
                    $pedido_id,
                    $item['producto_id'],
                    $item['cantidad'],
                    $item['precio_unitario'],
                    $item['subtotal']
                ]);
                
                // Actualizar stock
                if (!$this->actualizarStock($item['producto_id'], $item['cantidad'])) {
                    throw new Exception("Stock insuficiente para el producto ID: " . $item['producto_id']);
                }
            }
            
            $conn->commit();
            return $pedido_id;
            
        } catch (Exception $e) {
            $conn->rollBack();
            error_log("Error crearPedido: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtener pedidos de usuario
     */
    public function getPedidosUsuario($usuario_id) {
        $conn = $this->getConnection();
        
        $sql = "SELECT p.*, 
                (SELECT COUNT(*) FROM pedido_items WHERE pedido_id = p.id) as total_items
                FROM pedidos p 
                WHERE p.usuario_id = ? 
                ORDER BY p.fecha_pedido DESC";
        
        try {
            $stmt = $conn->prepare($sql);
            $stmt->execute([$usuario_id]);
            return $stmt->fetchAll();
            
        } catch(PDOException $e) {
            error_log("Error getPedidosUsuario: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtener detalle de pedido
     */
    public function getDetallePedido($pedido_id, $usuario_id = null) {
        $conn = $this->getConnection();
        
        $sql = "SELECT p.*, pi.*, prod.nombre as producto_nombre, prod.imagen as producto_imagen
                FROM pedidos p
                JOIN pedido_items pi ON p.id = pi.pedido_id
                JOIN productos prod ON pi.producto_id = prod.id
                WHERE p.id = ?";
        
        if ($usuario_id) {
            $sql .= " AND p.usuario_id = ?";
        }
        
        $sql .= " ORDER BY pi.id";
        
        try {
            $stmt = $conn->prepare($sql);
            $params = $usuario_id ? [$pedido_id, $usuario_id] : [$pedido_id];
            $stmt->execute($params);
            return $stmt->fetchAll();
            
        } catch(PDOException $e) {
            error_log("Error getDetallePedido: " . $e->getMessage());
            return [];
        }
    }

    // ==================== OPERACIONES DE CATEGORÍAS ====================

    /**
     * Obtener todas las categorías
     */
    public function getCategorias() {
        $conn = $this->getConnection();
        
        $sql = "SELECT * FROM categorias WHERE estado = 'activa' ORDER BY nombre";
        
        try {
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll();
            
        } catch(PDOException $e) {
            error_log("Error getCategorias: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtener productos por categoría
     */
    public function getProductosPorCategoria($categoria_id, $limite = null) {
        $conn = $this->getConnection();
        
        $sql = "SELECT p.*, c.nombre as categoria_nombre 
                FROM productos p 
                JOIN categorias c ON p.categoria_id = c.id 
                WHERE p.categoria_id = ? AND p.estado = 'activo' 
                ORDER BY p.ventas DESC";
        
        if ($limite) {
            $sql .= " LIMIT ?";
        }
        
        try {
            $stmt = $conn->prepare($sql);
            $params = $limite ? [$categoria_id, $limite] : [$categoria_id];
            $stmt->execute($params);
            return $stmt->fetchAll();
            
        } catch(PDOException $e) {
            error_log("Error getProductosPorCategoria: " . $e->getMessage());
            return [];
        }
    }

    // ==================== OPERACIONES DE FAVORITOS ====================

    /**
     * Agregar producto a favoritos
     */
    public function agregarFavorito($usuario_id, $producto_id) {
        $conn = $this->getConnection();
        
        // Verificar si ya existe
        $sql_check = "SELECT id FROM favoritos WHERE usuario_id = ? AND producto_id = ?";
        $stmt_check = $conn->prepare($sql_check);
        $stmt_check->execute([$usuario_id, $producto_id]);
        
        if ($stmt_check->fetch()) {
            return true; // Ya existe
        }
        
        $sql = "INSERT INTO favoritos (usuario_id, producto_id, fecha_agregado) VALUES (?, ?, NOW())";
        
        try {
            $stmt = $conn->prepare($sql);
            return $stmt->execute([$usuario_id, $producto_id]);
            
        } catch(PDOException $e) {
            error_log("Error agregarFavorito: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Remover producto de favoritos
     */
    public function removerFavorito($usuario_id, $producto_id) {
        $conn = $this->getConnection();
        
        $sql = "DELETE FROM favoritos WHERE usuario_id = ? AND producto_id = ?";
        
        try {
            $stmt = $conn->prepare($sql);
            return $stmt->execute([$usuario_id, $producto_id]);
            
        } catch(PDOException $e) {
            error_log("Error removerFavorito: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtener favoritos de usuario
     */
    public function getFavoritos($usuario_id) {
        $conn = $this->getConnection();
        
        $sql = "SELECT p.*, c.nombre as categoria_nombre 
                FROM favoritos f
                JOIN productos p ON f.producto_id = p.id
                JOIN categorias c ON p.categoria_id = c.id
                WHERE f.usuario_id = ? AND p.estado = 'activo'
                ORDER BY f.fecha_agregado DESC";
        
        try {
            $stmt = $conn->prepare($sql);
            $stmt->execute([$usuario_id]);
            return $stmt->fetchAll();
            
        } catch(PDOException $e) {
            error_log("Error getFavoritos: " . $e->getMessage());
            return [];
        }
    }

    // ==================== MÉTODOS DE ESTADÍSTICAS ====================

    /**
     * Obtener productos más vendidos
     */
    public function getProductosMasVendidos($limite = 10) {
        $conn = $this->getConnection();
        
        $sql = "SELECT p.*, c.nombre as categoria_nombre 
                FROM productos p 
                JOIN categorias c ON p.categoria_id = c.id 
                WHERE p.estado = 'activo' 
                ORDER BY p.ventas DESC 
                LIMIT ?";
        
        try {
            $stmt = $conn->prepare($sql);
            $stmt->execute([$limite]);
            return $stmt->fetchAll();
            
        } catch(PDOException $e) {
            error_log("Error getProductosMasVendidos: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtener estadísticas del sistema
     */
    public function getEstadisticas() {
        $conn = $this->getConnection();
        
        try {
            $estadisticas = [];
            
            // Total productos
            $sql = "SELECT COUNT(*) as total FROM productos WHERE estado = 'activo'";
            $stmt = $conn->query($sql);
            $estadisticas['total_productos'] = $stmt->fetch()['total'];
            
            // Total usuarios
            $sql = "SELECT COUNT(*) as total FROM usuarios WHERE estado = 'activo'";
            $stmt = $conn->query($sql);
            $estadisticas['total_usuarios'] = $stmt->fetch()['total'];
            
            // Total pedidos
            $sql = "SELECT COUNT(*) as total FROM pedidos";
            $stmt = $conn->query($sql);
            $estadisticas['total_pedidos'] = $stmt->fetch()['total'];
            
            // Ventas totales
            $sql = "SELECT COALESCE(SUM(total), 0) as total FROM pedidos WHERE estado = 'completado'";
            $stmt = $conn->query($sql);
            $estadisticas['ventas_totales'] = $stmt->fetch()['total'];
            
            return $estadisticas;
            
        } catch(PDOException $e) {
            error_log("Error getEstadisticas: " . $e->getMessage());
            return [];
        }
    }

    // ==================== MÉTODOS DE UTILIDAD ====================

    /**
     * Test de conexión
     */
    public function testConnection() {
        $conn = $this->getConnection();
        if ($conn) {
            echo "✅ Conexión a MySQL exitosa<br>";
            echo "📍 Host: " . $this->host . "<br>";
            echo "📦 Base de datos: " . $this->db_name . "<br>";
            
            try {
                // Contar productos
                $stmt = $conn->query("SELECT COUNT(*) as total FROM productos");
                $result = $stmt->fetch();
                echo "🛍️ Productos en BD: " . $result['total'] . "<br>";
                
                // Contar categorías
                $stmt = $conn->query("SELECT COUNT(*) as total FROM categorias");
                $result = $stmt->fetch();
                echo "🏷️ Categorías en BD: " . $result['total'] . "<br>";
                
                // Contar usuarios
                $stmt = $conn->query("SELECT COUNT(*) as total FROM usuarios");
                $result = $stmt->fetch();
                echo "👥 Usuarios en BD: " . $result['total'] . "<br>";
                
            } catch(PDOException $e) {
                echo "❌ Error en consultas: " . $e->getMessage() . "<br>";
            }
            
        } else {
            echo "❌ No se pudo conectar a la base de datos<br>";
        }
    }

    /**
     * Cerrar conexión
     */
    public function closeConnection() {
        $this->conn = null;
    }

    /**
     * Destructor
     */
    public function __destruct() {
        $this->closeConnection();
    }
}

// Ejemplo de uso:
// $database = new Database();
// $database->testConnection();
?>