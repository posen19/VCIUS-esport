-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         10.3.11-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             9.4.0.5125
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Volcando estructura de base de datos para vcius
CREATE DATABASE IF NOT EXISTS `vcius` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_bin */;
USE `vcius`;

-- Volcando estructura para tabla vcius.actividad
CREATE TABLE IF NOT EXISTS `actividad` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `iduser` int(11) NOT NULL,
  `tipo` int(11) NOT NULL,
  `ganancia` int(11) NOT NULL,
  `time_stamp` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  KEY `iduser` (`iduser`),
  KEY `FK_actividad_acttype` (`tipo`),
  CONSTRAINT `FK_actividad_acttype` FOREIGN KEY (`tipo`) REFERENCES `acttype` (`id`),
  CONSTRAINT `FK_actividad_user` FOREIGN KEY (`iduser`) REFERENCES `user` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1028 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- La exportación de datos fue deseleccionada.
-- Volcando estructura para tabla vcius.acttype
CREATE TABLE IF NOT EXISTS `acttype` (
  `id` int(11) NOT NULL,
  `name` varchar(50) COLLATE utf8_bin NOT NULL,
  `descript` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- La exportación de datos fue deseleccionada.
-- Volcando estructura para procedimiento vcius.actualizaActividad
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `actualizaActividad`(
	IN `username` VARCHAR(50),
	IN `vicios` INT,
	IN `tip` INT





)
    COMMENT 'Mira si tiene actividad reciente y da vcios si las tiene.'
BEGIN
	DECLARE id_u INTEGER;
	DECLARE tms TIMESTAMP;
	DECLARE diff INT DEFAULT 0;
	DECLARE num_rows INT DEFAULT 0;
	DECLARE no_more_rows BOOLEAN DEFAULT false;
	IF tip = 1 THEN
	BEGIN
		SELECT id INTO id_u
		FROM user
		WHERE name_disc = username;
	
		UPDATE user
		SET vcios = vcios + vicios
		WHERE id = id_u;
		
		INSERT INTO actividad(iduser, tipo, ganancia, time_stamp) VALUES(id_u, tip, vicios, CURRENT_TIMESTAMP);
	END;
	ELSE
	BEGIN
		SELECT id INTO id_u
		FROM user
		WHERE name_disc = username;
		
		SELECT time_stamp INTO tms
		FROM actividad
		WHERE iduser = id_u
			AND tip = tipo
		ORDER BY time_stamp DESC
		LIMIT 1;
		
		IF tms is null THEN
			SET diff = 2;
		ELSE
			SET diff = TIMESTAMPDIFF(MINUTE,tms, current_timestamp);
		END IF;
		
		IF diff > 1 THEN
		BEGIN
			INSERT INTO actividad(iduser, tipo, ganancia, time_stamp)
			VALUES (id_u, tip, vicios, current_timestamp);
			
			UPDATE user
			SET vcios = vcios + vicios
			WHERE id = id_u;
		END;
		END IF;
	END;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para tabla vcius.adminrole
CREATE TABLE IF NOT EXISTS `adminrole` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `roleName` varchar(50) COLLATE utf8_bin NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Aqui se introduce los roles administrativos.';

-- La exportación de datos fue deseleccionada.
-- Volcando estructura para tabla vcius.rolesclavo
CREATE TABLE IF NOT EXISTS `rolesclavo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rolName` varchar(50) COLLATE utf8_bin NOT NULL DEFAULT '0',
  `idAdmin` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FK__adminrole` (`idAdmin`),
  CONSTRAINT `FK__adminrole` FOREIGN KEY (`idAdmin`) REFERENCES `adminrole` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Aqui los roles esclavo del admin';

-- La exportación de datos fue deseleccionada.
-- Volcando estructura para función vcius.transformToPoints
DELIMITER //
CREATE DEFINER=`root`@`localhost` FUNCTION `transformToPoints`(
	`username` VARCHAR(50),
	`twitch` TINYINT





) RETURNS int(11)
    COMMENT 'Añade los puntos para los usuarios'
BEGIN
	DECLARE id_user INTEGER;
	DECLARE total_vcios INTEGER;
	DECLARE timestamp_ini timestamp;
	DECLARE diff INTEGER;
	DECLARE num_rows INT DEFAULT 0;
	DECLARE no_more_rows BOOLEAN DEFAULT false;
	IF username IS null THEN
	BEGIN
		DECLARE images_cur CURSOR FOR select id, vcios, t_init from user where t_init IS NOT null;
		DECLARE CONTINUE HANDLER FOR NOT FOUND SET no_more_rows = TRUE;
		OPEN images_cur;
		the_loop: LOOP FETCH images_cur INTO id_user, total_vcios, timestamp_ini;
		BEGIN
			IF no_more_rows THEN
				CLOSE images_cur;
				LEAVE the_loop;
				return 0;
			END IF;
			
			SET diff = TIMESTAMPDIFF(MINUTE,timestamp_ini,current_timestamp);
			
			UPDATE user
			SET t_init = null, vcios = total_vcios + diff
			WHERE id = id_user;
		END;
		END LOOP the_loop;
		RETURN 0;
	END;	
	ELSE
	BEGIN
		IF twitch THEN
		BEGIN	
			DECLARE timest INTEGER;
			SELECT t_init INTO timest FROM user WHERE name_tw = username;
			UPDATE user
			SET vcios = vcios + TIMESTAMPDIFF(MINUTE,timest,current_timestamp)
			WHERE name_tw = username;
			RETURN 0;
		END;
		ELSE
		BEGIN
			DECLARE timest INTEGER;
			SELECT t_init INTO timest from user where name_disc = username;
			UPDATE user
			SET vcios = vcios + TIMESTAMPDIFF(MINUTE,timest,current_timestamp)
			WHERE name_disc = username;
			RETURN 0;
		END;
		END IF;
		RETURN 1;
	END;
	END IF;
	RETURN 1;
END//
DELIMITER ;

-- Volcando estructura para tabla vcius.user
CREATE TABLE IF NOT EXISTS `user` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `NAME_TW` varchar(25) COLLATE utf8_bin DEFAULT NULL,
  `NAME_DISC` varchar(25) COLLATE utf8_bin DEFAULT NULL,
  `VCIOS` int(25) NOT NULL DEFAULT 0,
  `HASH` varchar(50) COLLATE utf8_bin NOT NULL DEFAULT '0',
  `T_INIT` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `NAME_KEY` (`NAME_TW`,`NAME_DISC`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Tabla de usuarios';

-- La exportación de datos fue deseleccionada.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
