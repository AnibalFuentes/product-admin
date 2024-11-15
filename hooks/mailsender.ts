export async function sendAccessDeniedEmail(dest:string,htmlPath:string) {
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: dest, // Cambia esto por el correo del destinatario
          subject: 'Acceso a la Cuenta Denegado',
          htmlPath: htmlPath, // Especifica la ruta del archivo HTML en la carpeta public
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert('Correo enviado exitosamente');
      } else {
        console.error('Error:', result.message);
        alert('Error al enviar el correo');
      }
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      alert('Error al enviar la solicitud');
    }
  }
  