<?php
require_once "config/database.php";

$database = new Database();

echo "<h2>Test de Conexión a Base de Datos</h2>";
echo "<div style='background: #f5f5f5; padding: 20px; border-radius: 10px;'>";

$database->testConnection();

echo "</div>";

// Probar consultas específicas
echo "<h2>Datos en la Base de Datos</h2>";

$db = $database->getConnection();

if ($db) {
    // Mostrar categorías
    echo "<h3>Categorías:</h3>";
    $query = "SELECT * FROM categorias";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    echo "<ul>";
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "<li><strong>" . $row['nombre'] . "</strong>: " . $row['descripcion'] . "</li>";
    }
    echo "</ul>";
    
    // Mostrar productos
    echo "<h3>Productos:</h3>";
    $query = "SELECT p.*, c.nombre as categoria_nombre 
            FROM productos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id 
            ORDER BY p.id";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    echo "<tr style='background: #e0e0e0;'>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Categoría</th>
            <th>Stock</th>
            <th>SKU</th>
        </tr>";
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "<tr>
                <td>" . $row['id'] . "</td>
                <td>" . $row['nombre'] . "</td>
                <td>$" . number_format($row['precio']) . "</td>
                <td>" . $row['categoria_nombre'] . "</td>
                <td>" . $row['stock'] . "</td>
                <td>" . $row['sku'] . "</td>
            </tr>";
    }
    echo "</table>";
    
    $database->closeConnection();
} else {
    echo "❌ No se pudo conectar a la base de datos";
}
?>