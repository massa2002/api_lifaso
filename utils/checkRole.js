

const checkRole = (requiredRole) => {
    return (req, res, next) => {
      if (!req.statut) {
        return res.status(403).json({ message: 'Role not assigned' });
      }
  
      if (req.statut !== requiredRole) {
        return res.status(403).json({ message: 'Unauthorized: Insufficient role' });
      }
  
      next();
    };
  };
  
  module.exports = checkRole;
  