-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: 62.149.150.124
-- Creato il: Lug 25, 2024 alle 17:01
-- Versione del server: 5.0.96-community-log
-- Versione PHP: 8.0.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `Sql365115_5`
--
CREATE DATABASE IF NOT EXISTS `Sql365115_5` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `Sql365115_5`;

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_calendars`
--

CREATE TABLE IF NOT EXISTS `grover_calendars` (
  `id` bigint(20) NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `lastUpdate` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_calendars`
--

INSERT INTO `grover_calendars` (`id`, `name`, `description`, `enabled`, `deleted`, `lastUpdate`) VALUES
(1, 'Default', '0', 1, 0, 1562667815000);

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_calendars_phases`
--

CREATE TABLE IF NOT EXISTS `grover_calendars_phases` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  `idDose` int(11) NOT NULL,
  `idCalendar` int(11) NOT NULL,
  `duration` int(11) NOT NULL,
  `pos` int(11) NOT NULL,
  `isBlooming` tinyint(1) NOT NULL,
  `isFlushing` int(20) NOT NULL DEFAULT '0',
  `minEC` float(3,1) NOT NULL,
  `maxEC` float(3,1) NOT NULL,
  `minPh` float(3,1) NOT NULL,
  `maxPh` float(3,1) NOT NULL,
  `lastUpdate` int(11) NOT NULL,
  `minTemp` float NOT NULL DEFAULT '0',
  `maxTemp` float NOT NULL DEFAULT '0',
  `minWaterLevel` float NOT NULL DEFAULT '0',
  `maxWaterLevel` float NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `id` (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=30 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_calendars_phases`
--

INSERT INTO `grover_calendars_phases` (`id`, `name`, `idDose`, `idCalendar`, `duration`, `pos`, `isBlooming`, `isFlushing`, `minEC`, `maxEC`, `minPh`, `maxPh`, `lastUpdate`, `minTemp`, `maxTemp`, `minWaterLevel`, `maxWaterLevel`) VALUES
(1, 'Seedling', 1, 1, 14, 1, 0, 0, 0.3, 1.2, 5.5, 5.7, 1, 15, 35, 10, 90),
(2, 'Veg Growth', 2, 1, 28, 2, 0, 0, 1.3, 1.8, 5.5, 6.0, 1, 15, 35, 10, 90),
(3, 'Early Bloom', 3, 1, 14, 3, 1, 0, 1.8, 2.0, 5.7, 6.0, 1, 15, 35, 10, 90),
(4, 'Late Bloom', 4, 1, 42, 4, 1, 0, 1.4, 2.2, 5.7, 6.2, 1, 15, 35, 10, 90),
(5, 'Ripen', 5, 1, 14, 5, 1, 1, 1.6, 2.6, 6.0, 6.4, 1, 15, 35, 10, 90);

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_calendar_doses`
--

CREATE TABLE IF NOT EXISTS `grover_calendar_doses` (
  `id` bigint(20) NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  `water` float NOT NULL,
  `grow` float NOT NULL,
  `micro` float NOT NULL,
  `bloom` float NOT NULL,
  `ripen` float NOT NULL,
  `pHDown` float NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `lastUpdate` bigint(20) NOT NULL,
  `color` varchar(7) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_calendar_doses`
--

INSERT INTO `grover_calendar_doses` (`id`, `name`, `water`, `grow`, `micro`, `bloom`, `ripen`, `pHDown`, `enabled`, `deleted`, `lastUpdate`, `color`) VALUES
(1, 'Seedling', 10, 5, 5, 5, 0, 1, 1, 0, 1561644827000, '#9ac53e'),
(2, 'Veg Growth', 10, 18, 12, 6, 0, 1, 1, 0, 1555340229000, '#05d59e'),
(3, 'Early Bloom', 10, 20, 20, 15, 0, 1, 1, 0, 1555334841000, '#fde84e'),
(4, 'Late Bloom', 10, 8, 16, 24, 0, 1, 1, 0, 1555334841000, '#fa761e'),
(5, 'Ripen', 10, 0, 0, 0, 50, 1, 1, 0, 1561731962000, '#e45a33');

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_companies`
--

CREATE TABLE IF NOT EXISTS `grover_companies` (
  `id` bigint(20) NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `lastUpdate` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=93 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_companies`
--

INSERT INTO `grover_companies` (`id`, `name`, `enabled`, `deleted`, `lastUpdate`) VALUES
(1, 'Sensi Seeds', 1, 0, 1554819201000),
(3, 'KC Brains Seeds', 1, 0, 1547765544000),
(4, 'Royal Qeen Seeds', 1, 0, 1546249105178),
(92, 'Seedsman', 1, 0, 1653739012000),
(91, 'Zamnesia', 1, 0, 1648541063000),
(90, 'Barney\'s Farm', 1, 0, 1645002638000);

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_containers`
--

CREATE TABLE IF NOT EXISTS `grover_containers` (
  `id` bigint(20) NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `lastUpdate` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_containers_type`
--

CREATE TABLE IF NOT EXISTS `grover_containers_type` (
  `id` bigint(20) NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `lastUpdate` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_locations`
--

CREATE TABLE IF NOT EXISTS `grover_locations` (
  `id` bigint(20) NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `lastUpdate` bigint(20) NOT NULL,
  `parent` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_locations`
--

INSERT INTO `grover_locations` (`id`, `name`, `enabled`, `deleted`, `lastUpdate`, `parent`) VALUES
(1, 'Bloom Room ', 1, 0, 1, 0),
(2, 'Veg Room ', 0, 0, 1, 0),
(3, 'Location Bloom1', 1, 0, 1644228819001, 1),
(4, 'Location Bloom2', 1, 0, 1644228819001, 1),
(5, 'Location Bloom3', 1, 0, 1644228819001, 1),
(6, 'Location Bloom4', 1, 0, 1644228819001, 1),
(7, 'Location Veg1', 1, 0, 1644228819001, 2),
(8, 'Location Veg2', 1, 0, 1644228819001, 2),
(9, 'Location Veg3', 1, 0, 1644228819001, 2),
(10, 'Location Veg4', 1, 0, 1644228819001, 2),
(11, 'Nursery', 1, 0, 1, 0),
(12, 'Nursery 1', 1, 0, 1, 11),
(13, 'Nursery 2', 1, 0, 1, 11),
(14, 'Nursery 3', 1, 0, 1, 11),
(15, 'Nursery 4', 1, 0, 1, 11);

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_mediums`
--

CREATE TABLE IF NOT EXISTS `grover_mediums` (
  `id` bigint(20) NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `lastUpdate` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_mediums`
--

INSERT INTO `grover_mediums` (`id`, `name`, `enabled`, `deleted`, `lastUpdate`) VALUES
(1, 'Hydro', 1, 0, 1562080566000),
(2, 'Soil', 1, 0, 1562080566000);

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_operating_modes`
--

CREATE TABLE IF NOT EXISTS `grover_operating_modes` (
  `id` bigint(20) NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `lastUpdate` bigint(20) NOT NULL,
  `priority` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_operating_modes`
--

INSERT INTO `grover_operating_modes` (`id`, `name`, `enabled`, `deleted`, `lastUpdate`, `priority`) VALUES
(1, 'Normal', 1, 0, 1546249105179, 0),
(2, 'Silent', 1, 0, 1546249105179, 1),
(3, 'Off', 1, 0, 1546249105179, 2);

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_plants`
--

CREATE TABLE IF NOT EXISTS `grover_plants` (
  `id` bigint(20) NOT NULL auto_increment,
  `idStrain` int(11) NOT NULL,
  `idCompany` int(11) DEFAULT NULL,
  `idGrowingMedium` int(11) NOT NULL,
  `idGrowingScenario` int(11) NOT NULL,
  `generation` int(11) NOT NULL,
  `dayStartGrow` bigint(20) NOT NULL DEFAULT '0',
  `dayTrimming` bigint(20) NOT NULL DEFAULT '0',
  `daySecondTrimming` bigint(20) NOT NULL DEFAULT '0',
  `dayStartBloom` bigint(20) NOT NULL DEFAULT '0',
  `dayStartFlush` bigint(20) NOT NULL DEFAULT '0',
  `dayHarvest` bigint(20) NOT NULL DEFAULT '0',
  `yeld` int(11) NOT NULL,
  `alerts` longtext,
  `notes` longtext,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `lastUpdate` bigint(20) NOT NULL,
  `idPot` int(11) DEFAULT NULL,
  `idCalendar` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_plants`
--

INSERT INTO `grover_plants` (`id`, `idStrain`, `idCompany`, `idGrowingMedium`, `idGrowingScenario`, `generation`, `dayStartGrow`, `dayTrimming`, `daySecondTrimming`, `dayStartBloom`, `dayStartFlush`, `dayHarvest`, `yeld`, `alerts`, `notes`, `enabled`, `deleted`, `lastUpdate`, `idPot`, `idCalendar`) VALUES
(1, 20, 89, 1, 0, 0, 1633046400000, 1643500800000, 0, 1643500800000, 1648224439000, 1649249711000, 0, '', '', 1, 0, 1643750557000, NULL, 1),
(2, 21, 1, 1, 0, 0, 1632528000000, 1643500800000, 0, 1643500800000, 1647676800000, 1648224439000, 0, '', '', 1, 0, 1643745100000, NULL, 1),
(3, 1, 1, 1, 0, 0, 1636070400000, 1643500800000, 0, 1643500800000, 1648224439000, 1648821966000, 0, '', '', 1, 0, 1643745130000, NULL, 1),
(4, 20, 89, 1, 0, 0, 1633046400000, 1643500800000, 0, 1643500800000, 1648224439000, 1649249711000, 0, '', '', 1, 0, 1643745151000, NULL, 1),
(5, 22, 1, 1, 0, 0, 1643328000000, 0, 0, 1648224439000, 1654121808000, 1654613882000, 0, '', '', 1, 0, 1655220513000, NULL, 1),
(6, 23, 1, 1, 0, 0, 1634860800000, 0, 0, 1649249711000, 1654121808000, 1655220513000, 0, '', '', 1, 0, 1655220513000, NULL, 1),
(7, 26, 90, 1, 1, 0, 1646382755000, 0, 0, 1649249711000, 1654121808000, 0, 0, '', '', 1, 0, 1656087324010, NULL, 1),
(8, 25, 1, 1, 0, 0, 1654300800000, 0, 0, 1648771200000, 1654121808000, 1654041600000, 0, '', '', 1, 0, 1656087324000, NULL, 1),
(9, 27, 90, 1, 0, 0, 1647644400000, 0, 0, 1654421633011, 0, 0, 0, NULL, NULL, 1, 0, 1654421633011, 2, 1),
(10, 36, 91, 1, 0, 0, 1648598400000, 0, 0, 1654613882000, 0, 0, 0, '', '', 1, 0, 1654853460000, 4, 1),
(11, 30, 91, 1, 0, 0, 1648598400000, 0, 0, 1656087324009, 0, 0, 0, NULL, NULL, 1, 0, 1656087324009, 1, 1),
(12, 33, 91, 1, 0, 0, 1648598400000, 0, 0, 0, 0, 0, 0, NULL, NULL, 1, 0, 1648626559000, 3, 1),
(13, 40, 91, 1, 0, 0, 1654074527000, 0, 0, 1662709920000, 0, 0, 0, '', '', 1, 0, 1662709920000, 8, 1),
(14, 39, 91, 1, 0, 0, 1654074527000, 0, 0, 1662709920000, 0, 0, 0, '', '', 1, 0, 1662709920000, 6, 1),
(15, 38, 91, 1, 0, 0, 1654074527000, 0, 0, 1662709920000, 0, 0, 0, '', '', 1, 0, 1662709920000, 5, 1),
(16, 37, 92, 1, 0, 0, 1654074527000, 0, 0, 1662709920000, 0, 0, 0, '', '', 1, 0, 1662709920000, 7, 1);

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_pots`
--

CREATE TABLE IF NOT EXISTS `grover_pots` (
  `id` bigint(20) NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `lastUpdate` bigint(20) NOT NULL,
  `locationId` int(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_pots`
--

INSERT INTO `grover_pots` (`id`, `name`, `enabled`, `deleted`, `lastUpdate`, `locationId`) VALUES
(1, 'Pot 1', 1, 0, 1662709920000, 1),
(2, 'Pot 2', 1, 0, 1662709920000, 2),
(3, 'Pot 3', 1, 0, 1662709920000, 3),
(4, 'Pot 4', 1, 0, 1662709920000, 4),
(5, 'Pot 5', 1, 0, 1662709920000, 5),
(6, 'Pot 6', 1, 0, 1662709920000, 6),
(7, 'Pot 7', 1, 0, 1662709920000, 7),
(8, 'Pot 8', 1, 0, 1662709920000, 8),
(9, 'N 1', 1, 0, 1654121808000, 12),
(10, 'N 2', 1, 0, 1654121808000, 13),
(11, 'N 3', 1, 0, 1654121808000, 14),
(12, 'N 4', 1, 0, 1654121808000, 15);

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_probes_list`
--

CREATE TABLE IF NOT EXISTS `grover_probes_list` (
  `id` int(11) NOT NULL auto_increment,
  `locationId` int(11) NOT NULL,
  `probeType` int(11) NOT NULL,
  `enabled` tinyint(1) NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `lastUpdate` bigint(20) NOT NULL,
  `address` varchar(20) NOT NULL,
  `pin1` int(11) DEFAULT NULL,
  `pin2` int(11) DEFAULT NULL,
  `i2cAddress` text,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=173 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_probes_list`
--

INSERT INTO `grover_probes_list` (`id`, `locationId`, `probeType`, `enabled`, `deleted`, `lastUpdate`, `address`, `pin1`, `pin2`, `i2cAddress`) VALUES
(1, 1, 1, 1, 0, 1, '28-0119140b7bd7', NULL, NULL, NULL),
(2, 3, 2, 1, 0, 1562136666002, '28-01191380b7f5', NULL, NULL, NULL),
(3, 3, 3, 1, 0, 1562136666002, '', 7, 8, '0x26'),
(4, 3, 4, 1, 0, 1562136666002, '', NULL, NULL, NULL),
(5, 3, 5, 1, 0, 1562136666002, '', NULL, NULL, NULL),
(6, 4, 2, 1, 0, 1562136666002, '28-0119140ee870', NULL, NULL, NULL),
(7, 4, 3, 1, 0, 1562136666002, '', NULL, NULL, NULL),
(8, 4, 4, 1, 0, 1562136666002, '', NULL, NULL, NULL),
(9, 4, 5, 1, 0, 1562136666002, '', NULL, NULL, NULL),
(10, 5, 2, 1, 0, 1562136666002, '28-0416a153e4ff', NULL, NULL, NULL),
(11, 5, 3, 1, 0, 1562136666002, '', NULL, NULL, NULL),
(12, 5, 4, 1, 0, 1562136666002, '', NULL, NULL, NULL),
(13, 5, 5, 1, 0, 1562136666002, '', NULL, NULL, NULL),
(14, 6, 2, 1, 0, 1562136666002, '28-01191408b4c6', NULL, NULL, NULL),
(15, 6, 3, 1, 0, 1562136666002, '', NULL, NULL, NULL),
(16, 6, 4, 1, 0, 1562136666002, '', NULL, NULL, NULL),
(17, 6, 5, 1, 0, 1562136666002, '', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_probes_log`
--

CREATE TABLE IF NOT EXISTS `grover_probes_log` (
  `id` int(11) NOT NULL auto_increment,
  `value` float NOT NULL,
  `idProbe` int(11) NOT NULL,
  `expectedTime` varchar(40) DEFAULT NULL,
  `executedTime` varchar(40) NOT NULL,
  `operatingMode` int(10) NOT NULL,
  `systemOperatingMode` int(11) NOT NULL,
  `serialNumber` varchar(40) NOT NULL,
  `action` varchar(40) NOT NULL,
  `ipAddress` varchar(40) NOT NULL,
  `parentId` int(11) NOT NULL,
  `parentName` varchar(40) NOT NULL,
  `lastUpdate` int(11) NOT NULL,
  `owner` varchar(40) NOT NULL,
  `type` int(11) NOT NULL,
  `address` varchar(40) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=387 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_probes_log`
--

INSERT INTO `grover_probes_log` (`id`, `value`, `idProbe`, `expectedTime`, `executedTime`, `operatingMode`, `systemOperatingMode`, `serialNumber`, `action`, `ipAddress`, `parentId`, `parentName`, `lastUpdate`, `owner`, `type`, `address`) VALUES
(1, 18.6, 1, NULL, '2022-03-18T07:49:06.971Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(2, 18.6, 14, NULL, '2022-03-18T07:49:07.089Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(3, 85, 2, NULL, '2022-03-18T07:49:07.049Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(4, 18.8, 10, NULL, '2022-03-18T07:49:08.009Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(5, 18.6, 1, NULL, '2022-03-18T07:49:47.129Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(6, 18.6, 14, NULL, '2022-03-18T07:49:47.209Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(7, 18.8, 10, NULL, '2022-03-18T07:49:47.409Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(8, 85, 2, NULL, '2022-03-18T07:49:48.249Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(9, 18.8, 2, NULL, '2022-03-18T07:50:01.455Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(10, 0, 2, NULL, '2022-03-18T07:50:17.231Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Pot 1', 2147483647, 'start', 0, ''),
(11, 0, 6, NULL, '2022-03-18T07:50:17.258Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 2, 'Pot 2', 2147483647, 'start', 0, ''),
(12, 0, 14, NULL, '2022-03-18T07:50:17.275Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 4, 'Pot 4', 2147483647, 'start', 0, ''),
(13, 0, 1, NULL, '2022-03-18T07:50:17.170Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Bloom', 2147483647, 'start', 0, ''),
(14, 0, 10, NULL, '2022-03-18T07:50:17.286Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 3, 'Pot 3', 2147483647, 'start', 0, ''),
(15, 0, 6, NULL, '2022-03-18T07:51:10.403Z', 0, 1, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 2, 'Pot 2', 2147483647, 'start', 0, ''),
(16, 0, 1, NULL, '2022-03-18T07:51:10.358Z', 0, 1, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Bloom', 2147483647, 'start', 0, ''),
(17, 0, 2, NULL, '2022-03-18T07:51:10.384Z', 0, 1, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Pot 1', 2147483647, 'start', 0, ''),
(18, 0, 14, NULL, '2022-03-18T07:51:10.428Z', 0, 1, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 4, 'Pot 4', 2147483647, 'start', 0, ''),
(19, 0, 10, NULL, '2022-03-18T07:51:10.436Z', 0, 1, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 3, 'Pot 3', 2147483647, 'start', 0, ''),
(20, 18.6, 1, NULL, '2022-03-18T07:52:30.969Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(21, 18.7, 14, NULL, '2022-03-18T07:52:31.059Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(22, 85, 2, NULL, '2022-03-18T07:52:31.129Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(23, 18.8, 10, NULL, '2022-03-18T07:52:31.209Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(24, 18.6, 1, NULL, '2022-03-18T07:54:43.209Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(25, 18.7, 14, NULL, '2022-03-18T07:54:43.289Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(26, 85, 2, NULL, '2022-03-18T07:54:43.329Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(27, 18.8, 10, NULL, '2022-03-18T07:54:44.249Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(28, 18.6, 1, NULL, '2022-03-18T07:54:50.170Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(29, 18.7, 14, NULL, '2022-03-18T07:54:50.250Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(30, 85, 2, NULL, '2022-03-18T07:54:50.329Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(31, 18.8, 10, NULL, '2022-03-18T07:54:50.384Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(32, 18.7, 14, NULL, '2022-03-18T07:55:09.609Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(33, 18.6, 1, NULL, '2022-03-18T07:55:09.649Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(34, 85, 2, NULL, '2022-03-18T07:55:09.699Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(35, 18.8, 10, NULL, '2022-03-18T07:55:09.770Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(36, 18.6, 1, NULL, '2022-03-18T07:56:10.409Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(37, 18.7, 14, NULL, '2022-03-18T07:56:10.488Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(38, 18.8, 10, NULL, '2022-03-18T07:56:10.572Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(39, 85, 2, NULL, '2022-03-18T07:56:10.608Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(40, 18.7, 1, NULL, '2022-03-18T07:59:13.209Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(41, 18.8, 14, NULL, '2022-03-18T07:59:13.288Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(42, 85, 2, NULL, '2022-03-18T07:59:13.370Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(43, 18.8, 10, NULL, '2022-03-18T07:59:13.409Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(44, 18.7, 1, NULL, '2022-03-18T07:59:26.409Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(45, 85, 2, NULL, '2022-03-18T07:59:26.499Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(46, 18.8, 14, NULL, '2022-03-18T07:59:26.539Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(47, 18.8, 10, NULL, '2022-03-18T07:59:26.579Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(48, 18.8, 10, '2022-03-18T08:00:00.000Z', '2022-03-18T08:00:01.059Z', 2, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, '28-0416a153e4ff'),
(49, 85, 2, '2022-03-18T08:00:00.000Z', '2022-03-18T08:00:01.098Z', 2, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, '28-01191380b7f5'),
(50, 18.8, 14, '2022-03-18T08:00:00.000Z', '2022-03-18T08:00:01.138Z', 2, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, '28-01191408b4c6'),
(51, 18.7, 1, '2022-03-18T08:00:00.000Z', '2022-03-18T08:00:01.209Z', 2, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, '28-0119140b7bd7'),
(52, 0, 2, NULL, '2022-03-18T08:01:48.501Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Pot 1', 2147483647, 'start', 0, ''),
(53, 0, 1, NULL, '2022-03-18T08:01:48.475Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Bloom', 2147483647, 'start', 0, ''),
(54, 0, 14, NULL, '2022-03-18T08:01:48.543Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 4, 'Pot 4', 2147483647, 'start', 0, ''),
(55, 0, 10, NULL, '2022-03-18T08:01:48.553Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 3, 'Pot 3', 2147483647, 'start', 0, ''),
(56, 0, 6, NULL, '2022-03-18T08:01:48.523Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 2, 'Pot 2', 2147483647, 'start', 0, ''),
(57, 19, 2, NULL, '2022-03-18T08:02:03.529Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(58, 18.8, 1, NULL, '2022-03-18T08:11:33.609Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(59, 18.9, 14, NULL, '2022-03-18T08:11:33.688Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(60, 19, 10, NULL, '2022-03-18T08:11:33.768Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(61, 85, 2, NULL, '2022-03-18T08:11:33.809Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(62, 18.9, 1, NULL, '2022-03-18T08:32:28.089Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(63, 19, 14, NULL, '2022-03-18T08:32:28.169Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(64, 85, 2, NULL, '2022-03-18T08:32:28.209Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(65, 19.1, 10, NULL, '2022-03-18T08:32:28.249Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(66, 19.6, 1, '2022-03-18T09:00:00.000Z', '2022-03-18T09:00:01.132Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, '28-0119140b7bd7'),
(67, 19.6, 14, '2022-03-18T09:00:00.000Z', '2022-03-18T09:00:01.209Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, '28-01191408b4c6'),
(68, 85, 2, '2022-03-18T09:00:00.000Z', '2022-03-18T09:00:01.289Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, '28-01191380b7f5'),
(69, 19.8, 10, '2022-03-18T09:00:00.000Z', '2022-03-18T09:00:01.369Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, '28-0416a153e4ff'),
(70, 18.9, 2, NULL, '2022-03-18T09:44:09.852Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(71, 18.6, 1, NULL, '2022-03-18T09:55:18.655Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(72, 18.7, 14, NULL, '2022-03-18T09:55:18.689Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(73, 85, 2, NULL, '2022-03-18T09:55:18.729Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(74, 18.7, 10, NULL, '2022-03-18T09:55:18.809Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(75, 18.6, 1, NULL, '2022-03-18T09:55:38.729Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(76, 18.7, 14, NULL, '2022-03-18T09:55:38.809Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(77, 85, 2, NULL, '2022-03-18T09:55:38.889Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(78, 18.7, 10, NULL, '2022-03-18T09:55:38.981Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(79, 85, 2, NULL, '2022-03-18T09:55:52.255Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(80, 18.9, 2, NULL, '2022-03-18T09:56:13.368Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(81, 18.6, 1, NULL, '2022-03-18T09:56:53.209Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(82, 18.7, 14, NULL, '2022-03-18T09:56:53.288Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(83, 85, 2, NULL, '2022-03-18T09:56:53.369Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(84, 18.7, 10, NULL, '2022-03-18T09:56:54.329Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(85, 18.6, 1, NULL, '2022-03-18T09:58:24.168Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(86, 18.6, 1, NULL, '2022-03-18T09:59:19.769Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(87, 18.7, 14, NULL, '2022-03-18T09:59:19.810Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(88, 18.7, 10, NULL, '2022-03-18T09:59:20.039Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(89, 85, 2, NULL, '2022-03-18T09:59:20.809Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(90, 18.6, 10, '2022-03-18T10:00:00.000Z', '2022-03-18T10:00:00.970Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, '28-0416a153e4ff'),
(91, 85, 2, '2022-03-18T10:00:00.000Z', '2022-03-18T10:00:01.059Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, '28-01191380b7f5'),
(92, 18.7, 14, '2022-03-18T10:00:00.000Z', '2022-03-18T10:00:01.129Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, '28-01191408b4c6'),
(93, 18.6, 1, '2022-03-18T10:00:00.000Z', '2022-03-18T10:00:01.219Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, '28-0119140b7bd7'),
(94, 18.6, 1, NULL, '2022-03-18T10:00:09.139Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(95, 18.7, 14, NULL, '2022-03-18T10:00:09.208Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(96, 85, 2, NULL, '2022-03-18T10:00:09.249Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(97, 18.6, 10, NULL, '2022-03-18T10:00:09.303Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(98, 18.6, 1, NULL, '2022-03-18T10:01:00.409Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(99, 18.7, 14, NULL, '2022-03-18T10:01:00.488Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(100, 85, 2, NULL, '2022-03-18T10:01:00.569Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(101, 18.6, 10, NULL, '2022-03-18T10:01:00.661Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(102, 18.6, 1, NULL, '2022-03-18T10:01:34.569Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(103, 18.7, 14, NULL, '2022-03-18T10:01:34.649Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(104, 85, 2, NULL, '2022-03-18T10:01:34.729Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(105, 18.6, 10, NULL, '2022-03-18T10:01:34.812Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(106, 18.6, 1, NULL, '2022-03-18T10:04:11.935Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(107, 85, 2, NULL, '2022-03-18T10:04:12.009Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(108, 18.6, 14, NULL, '2022-03-18T10:04:12.050Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(109, 18.6, 10, NULL, '2022-03-18T10:04:12.974Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(110, 18.6, 1, NULL, '2022-03-18T10:04:38.335Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(111, 18.6, 14, NULL, '2022-03-18T10:04:38.381Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(112, 85, 2, NULL, '2022-03-18T10:04:38.419Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(113, 18.6, 10, NULL, '2022-03-18T10:04:38.489Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(114, 18.5, 1, NULL, '2022-03-18T10:04:54.249Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(115, 18.6, 14, NULL, '2022-03-18T10:04:54.329Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(116, 85, 2, NULL, '2022-03-18T10:04:54.370Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(117, 18.6, 10, NULL, '2022-03-18T10:04:54.410Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(118, 18.5, 1, NULL, '2022-03-18T10:05:35.049Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(119, 18.6, 14, NULL, '2022-03-18T10:05:35.128Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(120, 18.6, 10, NULL, '2022-03-18T10:05:35.209Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(121, 85, 2, NULL, '2022-03-18T10:05:35.254Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(122, 18.5, 1, NULL, '2022-03-18T10:07:20.409Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(123, 18.6, 14, NULL, '2022-03-18T10:07:20.498Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(124, 85, 2, NULL, '2022-03-18T10:07:20.568Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(125, 18.6, 10, NULL, '2022-03-18T10:07:20.648Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(126, 18.8, 2, NULL, '2022-03-18T10:08:18.809Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(127, 18.5, 1, NULL, '2022-03-18T10:09:25.929Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(128, 18.6, 14, NULL, '2022-03-18T10:09:26.110Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(129, 18.5, 10, NULL, '2022-03-18T10:09:26.149Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(130, 85, 2, NULL, '2022-03-18T10:09:26.889Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(131, 18.4, 1, NULL, '2022-03-18T10:09:50.729Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(132, 18.6, 14, NULL, '2022-03-18T10:09:53.688Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(133, 85, 2, NULL, '2022-03-18T10:09:53.778Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(134, 18.5, 10, NULL, '2022-03-18T10:09:53.849Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(135, 18.5, 1, NULL, '2022-03-18T10:16:01.450Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(136, 19, 6, NULL, '2022-03-18T10:16:01.491Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(137, 18.6, 14, NULL, '2022-03-18T10:16:01.528Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(138, 85, 2, NULL, '2022-03-18T10:16:01.638Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(139, 18.6, 10, NULL, '2022-03-18T10:16:02.409Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(140, 18.5, 1, NULL, '2022-03-18T10:16:18.169Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(141, 19, 6, NULL, '2022-03-18T10:16:18.248Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(142, 85, 2, NULL, '2022-03-18T10:16:18.329Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(143, 18.6, 14, NULL, '2022-03-18T10:16:19.289Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(144, 18.6, 10, NULL, '2022-03-18T10:16:19.373Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(145, 18.5, 1, NULL, '2022-03-18T10:17:00.569Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(146, 18.6, 14, NULL, '2022-03-18T10:17:00.790Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(147, 85, 2, NULL, '2022-03-18T10:17:00.829Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(148, 18.6, 10, NULL, '2022-03-18T10:17:01.529Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(149, 19, 6, NULL, '2022-03-18T10:17:02.489Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(150, 18.4, 1, NULL, '2022-03-18T10:17:59.536Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(151, 19, 6, NULL, '2022-03-18T10:17:59.611Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(152, 18.6, 14, NULL, '2022-03-18T10:17:59.709Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(153, 85, 2, NULL, '2022-03-18T10:17:59.749Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(154, 18.6, 10, NULL, '2022-03-18T10:18:00.488Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(155, 19, 6, NULL, '2022-03-18T10:18:42.169Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(156, 18.4, 1, NULL, '2022-03-18T10:18:42.301Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(157, 18.6, 14, NULL, '2022-03-18T10:18:42.339Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(158, 85, 2, NULL, '2022-03-18T10:18:42.418Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(159, 18.6, 10, NULL, '2022-03-18T10:18:43.129Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(160, 18.5, 1, NULL, '2022-03-18T10:18:49.370Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(161, 19, 6, NULL, '2022-03-18T10:18:49.411Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(162, 18.6, 10, NULL, '2022-03-18T10:18:50.329Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(163, 85, 2, NULL, '2022-03-18T10:18:50.490Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(164, 18.6, 14, NULL, '2022-03-18T10:18:50.408Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(165, 18.4, 1, NULL, '2022-03-18T10:19:30.490Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(166, 18.6, 14, NULL, '2022-03-18T10:19:30.711Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(167, 85, 2, NULL, '2022-03-18T10:19:30.749Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(168, 18.6, 10, NULL, '2022-03-18T10:19:31.449Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(169, 19, 6, NULL, '2022-03-18T10:19:31.528Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(170, 18.4, 1, NULL, '2022-03-18T10:20:05.932Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(171, 19, 6, NULL, '2022-03-18T10:20:06.009Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(172, 18.6, 14, NULL, '2022-03-18T10:20:06.139Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(173, 18.6, 10, NULL, '2022-03-18T10:20:06.969Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(174, 18.8, 2, NULL, '2022-03-18T10:20:07.049Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(175, 18.4, 1, NULL, '2022-03-18T10:20:42.649Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(176, 18.6, 14, NULL, '2022-03-18T10:20:42.761Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(177, 19, 6, NULL, '2022-03-18T10:20:42.799Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(178, 85, 2, NULL, '2022-03-18T10:20:42.840Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(179, 18.6, 10, NULL, '2022-03-18T10:20:43.529Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(180, 18.4, 1, NULL, '2022-03-18T10:21:09.130Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(181, 18.6, 14, NULL, '2022-03-18T10:21:09.261Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(182, 18.6, 10, NULL, '2022-03-18T10:21:10.089Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(183, 19, 6, NULL, '2022-03-18T10:21:10.169Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(184, 85, 2, NULL, '2022-03-18T10:21:10.329Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(185, 18.4, 1, NULL, '2022-03-18T10:21:25.130Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(186, 19, 6, NULL, '2022-03-18T10:21:25.180Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(187, 18.6, 14, NULL, '2022-03-18T10:21:25.279Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(188, 85, 2, NULL, '2022-03-18T10:21:25.369Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(189, 18.6, 10, NULL, '2022-03-18T10:21:26.089Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(190, 18.4, 1, NULL, '2022-03-18T10:22:02.969Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(191, 19, 6, NULL, '2022-03-18T10:22:03.080Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(192, 18.6, 14, NULL, '2022-03-18T10:22:03.133Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(193, 85, 2, NULL, '2022-03-18T10:22:03.208Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(194, 18.6, 10, NULL, '2022-03-18T10:22:03.849Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(195, 18.5, 1, NULL, '2022-03-18T10:23:21.851Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(196, 18.6, 14, NULL, '2022-03-18T10:23:22.029Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(197, 85, 2, NULL, '2022-03-18T10:23:22.129Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(198, 18.6, 10, NULL, '2022-03-18T10:23:22.969Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(199, 19, 6, NULL, '2022-03-18T10:23:26.335Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(200, 18.4, 1, NULL, '2022-03-18T10:24:03.289Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(201, 18.6, 14, NULL, '2022-03-18T10:24:03.580Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(202, 18.6, 10, NULL, '2022-03-18T10:24:04.168Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(203, 85, 2, NULL, '2022-03-18T10:24:04.488Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(204, 0, 6, NULL, '2022-03-18T10:24:11.369Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(205, 18.4, 1, NULL, '2022-03-18T10:24:53.291Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(206, 19, 6, NULL, '2022-03-18T10:24:53.451Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(207, 18.6, 14, NULL, '2022-03-18T10:24:53.538Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(208, 85, 2, NULL, '2022-03-18T10:24:53.611Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(209, 18.6, 10, NULL, '2022-03-18T10:24:54.249Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(210, 18.4, 1, NULL, '2022-03-18T10:26:10.491Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(211, 19, 6, NULL, '2022-03-18T10:26:10.610Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(212, 85, 2, NULL, '2022-03-18T10:26:10.649Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(213, 18.6, 14, NULL, '2022-03-18T10:26:10.688Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(214, 18.6, 10, NULL, '2022-03-18T10:26:11.449Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(215, 18.5, 1, NULL, '2022-03-18T10:26:54.969Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(216, 19, 6, NULL, '2022-03-18T10:26:55.050Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(217, 18.6, 14, NULL, '2022-03-18T10:26:55.089Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(218, 85, 2, NULL, '2022-03-18T10:26:55.199Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(219, 18.6, 10, NULL, '2022-03-18T10:26:56.009Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(220, 19, 6, NULL, '2022-03-18T10:27:30.009Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(221, 18.6, 14, NULL, '2022-03-18T10:27:30.089Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(222, 18.5, 1, NULL, '2022-03-18T10:27:30.128Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(223, 85, 2, NULL, '2022-03-18T10:27:30.169Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(224, 18.6, 10, NULL, '2022-03-18T10:27:31.054Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(225, 18.5, 1, NULL, '2022-03-18T10:30:08.411Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(226, 18.6, 14, NULL, '2022-03-18T10:30:08.489Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(227, 19, 6, NULL, '2022-03-18T10:30:08.529Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(228, 85, 2, NULL, '2022-03-18T10:30:08.568Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(229, 18.6, 10, NULL, '2022-03-18T10:30:09.449Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(230, 18.5, 1, NULL, '2022-03-18T10:30:49.290Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(231, 19, 6, NULL, '2022-03-18T10:30:49.419Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(232, 18.6, 14, NULL, '2022-03-18T10:30:49.458Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(233, 85, 2, NULL, '2022-03-18T10:30:49.529Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(234, 18.6, 10, NULL, '2022-03-18T10:30:50.249Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(235, 18.5, 1, NULL, '2022-03-18T10:31:47.611Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(236, 19, 6, NULL, '2022-03-18T10:31:47.651Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(237, 18.6, 14, NULL, '2022-03-18T10:31:47.690Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(238, 85, 2, NULL, '2022-03-18T10:31:47.788Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(239, 18.6, 10, NULL, '2022-03-18T10:31:48.569Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(240, 18.5, 1, NULL, '2022-03-18T10:32:29.690Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(241, 18.6, 14, NULL, '2022-03-18T10:32:29.910Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(242, 85, 2, NULL, '2022-03-18T10:32:29.948Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(243, 18.6, 10, NULL, '2022-03-18T10:32:30.649Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(244, 19, 6, NULL, '2022-03-18T10:32:30.728Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(245, 19, 6, NULL, '2022-03-18T10:33:56.491Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(246, 18.5, 1, NULL, '2022-03-18T10:33:56.610Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(247, 18.6, 14, NULL, '2022-03-18T10:33:56.651Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(248, 85, 2, NULL, '2022-03-18T10:33:56.689Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(249, 18.6, 10, NULL, '2022-03-18T10:33:57.449Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(250, 18.5, 1, NULL, '2022-03-18T10:34:06.089Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(251, 19, 6, NULL, '2022-03-18T10:34:06.200Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(252, 18.6, 14, NULL, '2022-03-18T10:34:06.249Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(253, 85, 2, NULL, '2022-03-18T10:34:06.329Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(254, 18.6, 10, NULL, '2022-03-18T10:34:06.968Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(255, 18.5, 1, NULL, '2022-03-18T10:34:30.410Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(256, 19, 6, NULL, '2022-03-18T10:34:30.488Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(257, 85, 2, NULL, '2022-03-18T10:34:30.719Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(258, 18.6, 10, NULL, '2022-03-18T10:34:31.448Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(259, 18.6, 14, NULL, '2022-03-18T10:34:31.528Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(260, 19, 6, NULL, '2022-03-18T10:35:12.251Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(261, 18.5, 1, NULL, '2022-03-18T10:35:12.291Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(262, 18.6, 14, NULL, '2022-03-18T10:35:12.329Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(263, 85, 2, NULL, '2022-03-18T10:35:12.439Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(264, 18.6, 10, NULL, '2022-03-18T10:35:13.209Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(265, 18.5, 1, NULL, '2022-03-18T10:35:40.250Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(266, 18.6, 14, NULL, '2022-03-18T10:35:40.328Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(267, 85, 2, NULL, '2022-03-18T10:35:40.409Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(268, 19, 6, NULL, '2022-03-18T10:35:40.448Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(269, 18.6, 10, NULL, '2022-03-18T10:35:41.369Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(270, 18.5, 1, NULL, '2022-03-18T10:36:02.110Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(271, 85, 2, NULL, '2022-03-18T10:36:02.269Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(272, 18.6, 14, NULL, '2022-03-18T10:36:03.048Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(273, 18.6, 10, NULL, '2022-03-18T10:36:03.212Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(274, 0, 6, NULL, '2022-03-18T10:36:09.930Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, '28-0119140ee870'),
(275, 18.5, 1, NULL, '2022-03-18T10:42:47.134Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(276, 18.6, 14, NULL, '2022-03-18T10:42:47.209Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(277, 85, 2, NULL, '2022-03-18T10:42:47.303Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(278, 18.6, 10, NULL, '2022-03-18T10:42:47.368Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(279, 18.6, 1, NULL, '2022-03-18T10:43:20.649Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(280, 18.6, 14, NULL, '2022-03-18T10:43:20.729Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(281, 85, 2, NULL, '2022-03-18T10:43:20.769Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(282, 18.6, 10, NULL, '2022-03-18T10:43:20.808Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(283, 18.6, 1, NULL, '2022-03-18T10:47:03.049Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(284, 18.6, 14, NULL, '2022-03-18T10:47:03.128Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(285, 85, 2, NULL, '2022-03-18T10:47:03.210Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(286, 18.6, 10, NULL, '2022-03-18T10:47:03.288Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(287, 18.6, 1, NULL, '2022-03-18T10:48:57.529Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(288, 18.6, 14, NULL, '2022-03-18T10:48:57.609Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(289, 18.6, 10, NULL, '2022-03-18T10:48:57.749Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(290, 85, 2, NULL, '2022-03-18T10:48:58.574Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(291, 18.6, 1, NULL, '2022-03-18T10:49:58.649Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(292, 18.6, 14, NULL, '2022-03-18T10:49:58.729Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(293, 85, 2, NULL, '2022-03-18T10:49:58.819Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(294, 18.7, 10, NULL, '2022-03-18T10:49:58.890Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(295, 18.6, 1, NULL, '2022-03-18T10:50:30.329Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(296, 18.7, 14, NULL, '2022-03-18T10:50:30.409Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(297, 18.6, 10, NULL, '2022-03-18T10:50:30.599Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(298, 85, 2, NULL, '2022-03-18T10:50:31.368Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(299, 18.6, 1, NULL, '2022-03-18T10:50:36.329Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(300, 18.7, 14, NULL, '2022-03-18T10:50:36.408Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(301, 18.7, 10, NULL, '2022-03-18T10:50:36.488Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(302, 85, 2, NULL, '2022-03-18T10:50:36.528Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(303, 85, 2, NULL, '2022-03-18T10:51:49.688Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(304, 18.7, 14, NULL, '2022-03-18T10:51:49.609Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(305, 18.6, 1, NULL, '2022-03-18T10:51:49.649Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(306, 18.6, 10, NULL, '2022-03-18T10:51:49.779Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(307, 18.6, 1, NULL, '2022-03-18T10:52:20.489Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(308, 85, 2, NULL, '2022-03-18T10:52:20.568Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(309, 18.7, 14, NULL, '2022-03-18T10:52:20.609Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(310, 18.7, 10, NULL, '2022-03-18T10:52:20.649Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(311, 18.6, 1, NULL, '2022-03-18T10:53:58.409Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(312, 18.7, 14, NULL, '2022-03-18T10:53:58.489Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(313, 85, 2, NULL, '2022-03-18T10:53:58.568Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(314, 18.7, 10, NULL, '2022-03-18T10:53:58.648Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(315, 18.6, 1, NULL, '2022-03-18T10:54:34.409Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(316, 18.7, 14, NULL, '2022-03-18T10:54:34.488Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(317, 18.7, 10, NULL, '2022-03-18T10:54:34.569Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(318, 85, 2, NULL, '2022-03-18T10:54:34.609Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(319, 18.6, 1, NULL, '2022-03-18T10:54:58.249Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(320, 18.7, 14, NULL, '2022-03-18T10:54:58.328Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(321, 85, 2, NULL, '2022-03-18T10:54:58.408Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(322, 18.7, 10, NULL, '2022-03-18T10:54:58.490Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(323, 18.6, 1, NULL, '2022-03-18T10:55:18.969Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7');
INSERT INTO `grover_probes_log` (`id`, `value`, `idProbe`, `expectedTime`, `executedTime`, `operatingMode`, `systemOperatingMode`, `serialNumber`, `action`, `ipAddress`, `parentId`, `parentName`, `lastUpdate`, `owner`, `type`, `address`) VALUES
(324, 18.7, 14, NULL, '2022-03-18T10:55:19.048Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(325, 85, 2, NULL, '2022-03-18T10:55:19.128Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(326, 18.7, 10, NULL, '2022-03-18T10:55:19.289Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(327, 18.6, 1, NULL, '2022-03-18T10:55:44.730Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(328, 18.7, 14, NULL, '2022-03-18T10:55:44.808Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(329, 85, 2, NULL, '2022-03-18T10:55:44.888Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(330, 18.7, 10, NULL, '2022-03-18T10:55:44.969Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(331, 18.6, 1, '2022-03-18T11:00:00.000Z', '2022-03-18T11:00:01.049Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, '28-0119140b7bd7'),
(332, 18.7, 14, '2022-03-18T11:00:00.000Z', '2022-03-18T11:00:01.128Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, '28-01191408b4c6'),
(333, 85, 2, '2022-03-18T11:00:00.000Z', '2022-03-18T11:00:01.208Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, '28-01191380b7f5'),
(334, 18.7, 10, '2022-03-18T11:00:00.000Z', '2022-03-18T11:00:01.290Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, '28-0416a153e4ff'),
(335, 18.6, 1, NULL, '2022-03-18T11:23:38.088Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(336, 19.1, 10, '2022-03-18T12:00:00.000Z', '2022-03-18T12:00:00.969Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, '28-0416a153e4ff'),
(337, 85, 2, '2022-03-18T12:00:00.000Z', '2022-03-18T12:00:01.129Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, '28-01191380b7f5'),
(338, 19.1, 14, '2022-03-18T12:00:00.000Z', '2022-03-18T12:00:01.208Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, '28-01191408b4c6'),
(339, 19, 1, '2022-03-18T12:00:00.000Z', '2022-03-18T12:00:01.288Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, '28-0119140b7bd7'),
(340, 19.2, 1, '2022-03-18T13:00:00.000Z', '2022-03-18T13:00:00.969Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, '28-0119140b7bd7'),
(341, 19.3, 14, '2022-03-18T13:00:00.000Z', '2022-03-18T13:00:01.049Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, '28-01191408b4c6'),
(342, 85, 2, '2022-03-18T13:00:00.000Z', '2022-03-18T13:00:01.129Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, '28-01191380b7f5'),
(343, 19.3, 10, '2022-03-18T13:00:00.000Z', '2022-03-18T13:00:01.179Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, '28-0416a153e4ff'),
(344, 19.3, 10, '2022-03-18T14:00:00.000Z', '2022-03-18T14:00:00.969Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, '28-0416a153e4ff'),
(345, 85, 2, '2022-03-18T14:00:00.000Z', '2022-03-18T14:00:01.049Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, '28-01191380b7f5'),
(346, 19.4, 14, '2022-03-18T14:00:00.000Z', '2022-03-18T14:00:01.088Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, '28-01191408b4c6'),
(347, 19.3, 1, '2022-03-18T14:00:00.000Z', '2022-03-18T14:00:01.128Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, '28-0119140b7bd7'),
(348, 19.8, 14, '2022-03-18T15:00:00.000Z', '2022-03-18T15:00:00.969Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, '28-01191408b4c6'),
(349, 19.6, 1, '2022-03-18T15:00:00.000Z', '2022-03-18T15:00:01.048Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, '28-0119140b7bd7'),
(350, 85, 2, '2022-03-18T15:00:00.000Z', '2022-03-18T15:00:01.128Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, '28-01191380b7f5'),
(351, 19.6, 10, '2022-03-18T15:00:00.000Z', '2022-03-18T15:00:01.208Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, '28-0416a153e4ff'),
(352, 19.3, 10, '2022-03-18T16:00:00.000Z', '2022-03-18T16:00:00.969Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, '28-0416a153e4ff'),
(353, 85, 2, '2022-03-18T16:00:00.000Z', '2022-03-18T16:00:01.048Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, '28-01191380b7f5'),
(354, 19.2, 1, '2022-03-18T16:00:00.000Z', '2022-03-18T16:00:01.129Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, '28-0119140b7bd7'),
(355, 19.3, 14, '2022-03-18T16:00:00.000Z', '2022-03-18T16:00:01.169Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, '28-01191408b4c6'),
(356, 18.9, 1, '2022-03-18T17:00:00.000Z', '2022-03-18T17:00:00.969Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, '28-0119140b7bd7'),
(357, 19, 14, '2022-03-18T17:00:00.000Z', '2022-03-18T17:00:01.048Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, '28-01191408b4c6'),
(358, 85, 2, '2022-03-18T17:00:00.000Z', '2022-03-18T17:00:01.128Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, '28-01191380b7f5'),
(359, 19, 10, '2022-03-18T17:00:00.000Z', '2022-03-18T17:00:01.219Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, '28-0416a153e4ff'),
(360, 18.7, 10, '2022-03-18T18:00:00.000Z', '2022-03-18T18:00:00.969Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, '28-0416a153e4ff'),
(361, 85, 2, '2022-03-18T18:00:00.000Z', '2022-03-18T18:00:01.049Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, '28-01191380b7f5'),
(362, 18.6, 14, '2022-03-18T18:00:00.000Z', '2022-03-18T18:00:01.089Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, '28-01191408b4c6'),
(363, 18.6, 1, '2022-03-18T18:00:00.000Z', '2022-03-18T18:00:01.129Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, '28-0119140b7bd7'),
(364, 18.6, 1, '2022-03-18T19:00:00.000Z', '2022-03-18T19:00:01.069Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, '28-0119140b7bd7'),
(365, 18.6, 14, '2022-03-18T19:00:00.000Z', '2022-03-18T19:00:01.076Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, '28-01191408b4c6'),
(366, 19, 6, '2022-03-18T19:00:00.000Z', '2022-03-18T19:00:01.235Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 2, 'Pot 2', 2147483647, 'schedule', 0, '28-0119140ee870'),
(367, 18.6, 10, '2022-03-18T19:00:00.000Z', '2022-03-18T19:00:01.849Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, '28-0416a153e4ff'),
(368, 85, 2, '2022-03-18T19:00:00.000Z', '2022-03-18T19:00:02.009Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, '28-01191380b7f5'),
(369, 18.8, 10, '2022-03-18T20:00:00.000Z', '2022-03-18T20:00:00.969Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, '28-0416a153e4ff'),
(370, 18.8, 14, '2022-03-18T20:00:00.000Z', '2022-03-18T20:00:01.049Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, '28-01191408b4c6'),
(371, 85, 2, '2022-03-18T20:00:00.000Z', '2022-03-18T20:00:01.089Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, '28-01191380b7f5'),
(372, 18.8, 1, '2022-03-18T20:00:00.000Z', '2022-03-18T20:00:02.009Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, '28-0119140b7bd7'),
(373, 18.7, 1, '2022-03-18T21:00:00.000Z', '2022-03-18T21:00:00.969Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, '28-0119140b7bd7'),
(374, 18.8, 14, '2022-03-18T21:00:00.000Z', '2022-03-18T21:00:01.049Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, '28-01191408b4c6'),
(375, 85, 2, '2022-03-18T21:00:00.000Z', '2022-03-18T21:00:01.129Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, '28-01191380b7f5'),
(376, 18.8, 10, '2022-03-18T21:00:00.000Z', '2022-03-18T21:00:01.169Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, '28-0416a153e4ff'),
(377, 18.9, 10, '2022-03-18T22:00:00.000Z', '2022-03-18T22:00:00.970Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, '28-0416a153e4ff'),
(378, 18.8, 14, '2022-03-18T22:00:00.000Z', '2022-03-18T22:00:01.049Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, '28-01191408b4c6'),
(379, 85, 2, '2022-03-18T22:00:00.000Z', '2022-03-18T22:00:01.100Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, '28-01191380b7f5'),
(380, 18.8, 1, '2022-03-18T22:00:00.000Z', '2022-03-18T22:00:01.139Z', 2, 2, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, '28-0119140b7bd7'),
(381, 0, 14, NULL, '2022-03-30T09:38:14.686Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 4, 'Pot 4', 2147483647, 'user', 0, '28-01191408b4c6'),
(382, 0, 1, NULL, '2022-03-30T09:38:15.006Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, '28-0119140b7bd7'),
(383, 0, 2, NULL, '2022-03-30T09:38:15.316Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(384, 0, 10, NULL, '2022-03-30T09:38:15.635Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, '28-0416a153e4ff'),
(385, 0, 2, NULL, '2022-03-30T09:38:54.475Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5'),
(386, 0, 2, NULL, '2022-03-30T09:39:10.485Z', 1, 1, '10000000ce6b74fc', 'READ', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, '28-01191380b7f5');

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_probes_schedule`
--

CREATE TABLE IF NOT EXISTS `grover_probes_schedule` (
  `id` int(11) NOT NULL auto_increment,
  `idProbe` int(11) NOT NULL,
  `enabled` tinyint(1) NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `lastUpdate` bigint(20) NOT NULL,
  `atMinute` varchar(11) DEFAULT NULL,
  `atHour` varchar(11) DEFAULT NULL,
  `atDay` varchar(11) DEFAULT NULL,
  `action` varchar(20) NOT NULL,
  `operatingMode` int(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=35 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_probes_schedule`
--

INSERT INTO `grover_probes_schedule` (`id`, `idProbe`, `enabled`, `deleted`, `lastUpdate`, `atMinute`, `atHour`, `atDay`, `action`, `operatingMode`) VALUES
(1, 1, 1, 0, 1, '0', '*', '*', 'READ', 2),
(2, 2, 1, 0, 1, '0', '11,15,19,23', '1-5', 'READ', 2),
(3, 6, 1, 0, 1, '0', '10,14,18,22', '1-5', 'READ', 2),
(4, 10, 1, 0, 1, '0', '9,13,17,21', '1-5', 'READ', 2),
(5, 14, 1, 0, 1, '0', '8,12,16,20', '1-5', 'READ', 2),
(6, 3, 1, 0, 1, '30', '11,15,19,23', '1-5', 'READ', 2),
(7, 7, 1, 0, 1, '30', '10,14,18,22', '1-5', 'READ', 2),
(8, 11, 1, 0, 1, '30', '9,13,17,21', '1-5', 'READ', 2),
(9, 15, 1, 0, 1, '30', '8,12,16,20', '1-5', 'READ', 2),
(10, 4, 1, 0, 1, '20', '11,15,19,23', '1-5', 'READ', 2),
(11, 8, 1, 0, 1, '20', '10,14,18,22', '1-5', 'READ', 2),
(12, 12, 1, 0, 1, '20', '9,13,17,21', '1-5', 'READ', 2),
(13, 16, 1, 0, 1, '20', '8,12,16,20', '1-5', 'READ', 2),
(14, 5, 1, 0, 1, '10', '11,15,19,23', '1-5', 'READ', 2),
(15, 9, 1, 0, 1, '10', '10,14,18,22', '1-5', 'READ', 2),
(16, 13, 1, 0, 1, '10', '9,13,17,21', '1-5', 'READ', 2),
(17, 17, 1, 0, 1, '10', '8,12,16,20', '1-5', 'READ', 2),
(19, 2, 1, 0, 1, '0', '11,15,19,23', '6,0', 'READ', 2),
(20, 3, 1, 0, 1, '30', '11,15,19,23', '6,0', 'READ', 2),
(21, 4, 1, 0, 1, '20', '11,15,19,23', '6,0', 'READ', 2),
(22, 5, 1, 0, 1, '10', '11,15,19,23', '6,0', 'READ', 2),
(23, 6, 1, 0, 1, '0', '10,14,18,22', '6,0', 'READ', 2),
(24, 7, 1, 0, 1, '30', '10,14,18,22', '6,0', 'READ', 2),
(25, 8, 1, 0, 1, '20', '10,14,18,22', '6,0', 'READ', 2),
(26, 9, 1, 0, 1, '10', '10,14,18,22', '6,0', 'READ', 2),
(27, 10, 1, 0, 1, '0', '13,17,21', '6,0', 'READ', 2),
(28, 11, 1, 0, 1, '30', '13,17,21', '6,0', 'READ', 2),
(29, 12, 1, 0, 1, '20', '13,17,21', '6,0', 'READ', 2),
(30, 13, 1, 0, 1, '10', '13,17,21', '6,0', 'READ', 2),
(31, 14, 1, 0, 1, '0', '12,16,20', '6,0', 'READ', 2),
(32, 15, 1, 0, 1, '30', '12,16,20', '6,0', 'READ', 2),
(33, 16, 1, 0, 1, '20', '12,16,20', '6,0', 'READ', 2),
(34, 17, 1, 0, 1, '10', '12,16,20', '6,0', 'READ', 2);

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_probes_type`
--

CREATE TABLE IF NOT EXISTS `grover_probes_type` (
  `id` int(11) NOT NULL auto_increment,
  `type` varchar(255) NOT NULL,
  `color` varchar(7) NOT NULL,
  `um` varchar(10) NOT NULL,
  `enabled` tinyint(4) NOT NULL,
  `deleted` tinyint(4) NOT NULL,
  `lastUpdate` bigint(20) NOT NULL,
  `icon` varchar(20) NOT NULL,
  `minAcceptableValue` float NOT NULL DEFAULT '0',
  `maxAcceptableValue` float NOT NULL DEFAULT '0',
  `title` varchar(40) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_probes_type`
--

INSERT INTO `grover_probes_type` (`id`, `type`, `color`, `um`, `enabled`, `deleted`, `lastUpdate`, `icon`, `minAcceptableValue`, `maxAcceptableValue`, `title`) VALUES
(1, 'Air_temperature', '3AE5ED', '°C', 1, 0, 1562079681000, 'temperature-half', 0, 50, 'Air T°'),
(2, 'Water_temperature', '3A65ED', '°C', 1, 0, 1562079681000, 'temperature-half', 0, 50, 'H<sub>2</sub>O T°'),
(3, 'Water_level', '3A65ED', 'cm', 1, 0, 1562079681000, 'ruler', 0, 100, 'H<sub>2</sub>O Level'),
(4, 'pH', 'ED3A3A', 'pH', 1, 0, 1562079681000, 'swatchbook', 5, 7, 'pH'),
(5, 'EC', 'EA3AED', 'EC', 1, 0, 1562079681000, 'plug', 0, 3, 'EC');

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_rooms`
--

CREATE TABLE IF NOT EXISTS `grover_rooms` (
  `id` bigint(20) NOT NULL auto_increment,
  `isBlooming` tinyint(1) NOT NULL,
  `isVegetative` tinyint(1) NOT NULL DEFAULT '0',
  `isNursery` tinyint(1) NOT NULL DEFAULT '0',
  `isHarvested` tinyint(1) NOT NULL DEFAULT '0',
  `name` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `lastUpdate` bigint(20) NOT NULL,
  `serialNumber` varchar(40) NOT NULL,
  `locationId` int(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_rooms`
--

INSERT INTO `grover_rooms` (`id`, `isBlooming`, `isVegetative`, `isNursery`, `isHarvested`, `name`, `enabled`, `deleted`, `lastUpdate`, `serialNumber`, `locationId`) VALUES
(1, 1, 0, 0, 0, 'Bloom', 1, 0, 1644228819001, '10000000ce6b74fc', 1),
(2, 0, 1, 0, 0, 'Veg', 1, 0, 1644228819001, '', 2),
(4, 0, 0, 1, 0, 'Nursery', 1, 0, 1, '', 11),
(5, 0, 0, 0, 1, 'Harvested', 1, 0, 1546249105179, '', NULL);

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_scenarios`
--

CREATE TABLE IF NOT EXISTS `grover_scenarios` (
  `id` bigint(20) NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `lastUpdate` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_scenarios`
--

INSERT INTO `grover_scenarios` (`id`, `name`, `enabled`, `deleted`, `lastUpdate`) VALUES
(1, 'Indoor', 1, 0, 1546249105179),
(2, 'Outdoor', 1, 0, 1546249105179);

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_settings`
--

CREATE TABLE IF NOT EXISTS `grover_settings` (
  `id` int(11) NOT NULL auto_increment,
  `enabled` tinyint(1) NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `lastUpdate` bigint(20) NOT NULL,
  `address` varchar(255) NOT NULL,
  `port` int(11) NOT NULL,
  `device` varchar(255) NOT NULL,
  `operatingMode` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_settings`
--

INSERT INTO `grover_settings` (`id`, `enabled`, `deleted`, `lastUpdate`, `address`, `port`, `device`, `operatingMode`) VALUES
(1, 1, 0, 1721682978000, '151.51.241.133', 8084, '10000000ce6b74fc', 1);

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_strains`
--

CREATE TABLE IF NOT EXISTS `grover_strains` (
  `id` bigint(20) NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  `lineage` varchar(255) NOT NULL,
  `percentSativa` int(3) NOT NULL COMMENT '% sativa',
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `lastUpdate` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=41 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_strains`
--

INSERT INTO `grover_strains` (`id`, `name`, `lineage`, `percentSativa`, `enabled`, `deleted`, `lastUpdate`) VALUES
(0, 'Landrace', '0', 0, 1, 0, 1546249105179),
(1, 'Northern Lights #5 x Haze', '2,3', 50, 1, 0, 1643641970000),
(2, 'Northern Lights #5', '4', 0, 1, 0, 1546249105179),
(3, 'Haze', '0', 100, 1, 0, 1546249105179),
(4, 'Afgani', '0', 0, 1, 0, 1546249105179),
(6, 'Brain Damage', '10,11,12,13', 70, 1, 0, 1546249105179),
(7, 'Amnesia Haze', '3', 70, 1, 0, 1546249105179),
(8, 'Skunk #1', '4', 65, 1, 0, 1546249105179),
(9, 'Cheese', '4,8', 60, 1, 0, 1546249105179),
(10, 'Acapulco', '20', 0, 1, 0, 1546249105179),
(11, 'Hawaii 93', '20', 0, 1, 0, 1546249105179),
(12, 'Mango 2001', '20', 0, 1, 0, 1546249105179),
(13, 'KC36', '20', 0, 1, 0, 1546249105179),
(20, '–', '0', 50, 1, 0, 1643705316000),
(21, 'White Gorilla Haze', '20', 50, 1, 0, 1643705336000),
(22, 'Peyote Critical', '20', 50, 1, 0, 1643705350000),
(23, 'Black Domina', '20', 50, 1, 0, 1643705365000),
(24, 'Silver Fire', '20', 50, 1, 0, 1643705376000),
(25, 'Dos Si Dos 33', '20', 50, 1, 0, 1643705396000),
(26, 'Banana Punch', '', 50, 1, 0, 1646425723000),
(27, 'Strawberry Lemonade', '20', 50, 1, 0, 1),
(28, 'Thin Mint GSC', '20', 50, 1, 0, 1648541128000),
(29, 'Grape Pie', '20', 50, 1, 0, 1648541149000),
(30, 'Lava Cake', '28,29', 30, 1, 0, 1648541173000),
(31, 'Gelato', '20', 50, 1, 0, 1648541205000),
(32, 'Zkittlez', '20', 50, 1, 0, 1648541224000),
(33, 'Runtz', '31,32', 50, 1, 0, 1648541242000),
(34, 'Guava', '20', 50, 1, 0, 1648541260000),
(35, 'Frosted Skywalker', '20', 50, 1, 0, 1648541286000),
(36, 'Frosted Guava', '34,35', 10, 1, 0, 1648541329000),
(37, 'Black sugar', '20', 50, 1, 0, 1653738967000),
(38, 'Banana', '20', 50, 1, 0, 1653743836000),
(39, 'Girl Scout Cookies', '20', 50, 1, 0, 1653743874000),
(40, 'Sweet ZZ', '20', 50, 1, 0, 1653743910000);

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_system_log`
--

CREATE TABLE IF NOT EXISTS `grover_system_log` (
  `id` int(11) NOT NULL auto_increment,
  `expectedTime` varchar(40) DEFAULT NULL,
  `executedTime` varchar(40) NOT NULL,
  `operatingMode` int(10) NOT NULL,
  `systemOperatingMode` int(11) NOT NULL,
  `serialNumber` varchar(40) NOT NULL,
  `action` varchar(40) NOT NULL,
  `ipAddress` varchar(40) NOT NULL,
  `lastUpdate` int(11) NOT NULL,
  `owner` varchar(40) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=85 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_system_log`
--

INSERT INTO `grover_system_log` (`id`, `expectedTime`, `executedTime`, `operatingMode`, `systemOperatingMode`, `serialNumber`, `action`, `ipAddress`, `lastUpdate`, `owner`) VALUES
(1, '2022-03-17T23:00:00.000Z', '2022-03-17T23:00:00.211Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(2, '2022-03-18T00:00:00.000Z', '2022-03-18T00:00:00.037Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(3, '2022-03-18T01:00:00.000Z', '2022-03-18T01:00:00.119Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(4, '2022-03-18T02:00:00.000Z', '2022-03-18T02:00:00.039Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(5, '2022-03-18T03:00:00.000Z', '2022-03-18T03:00:00.117Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(6, '2022-03-18T04:00:00.000Z', '2022-03-18T04:00:00.053Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(7, '2022-03-18T05:00:00.000Z', '2022-03-18T05:00:00.120Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(8, '2022-03-18T06:00:00.000Z', '2022-03-18T06:00:00.038Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(9, '2022-03-18T07:00:00.000Z', '2022-03-18T07:00:00.102Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(10, NULL, '2022-03-18T07:44:06.092Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'start'),
(11, NULL, '2022-03-18T07:50:17.298Z', 1, 2, '10000000ce6b74fc', 'SET_MODE', '151.61.172.169', 2147483647, 'user'),
(12, NULL, '2022-03-18T07:51:10.448Z', 2, 1, '10000000ce6b74fc', 'SET_MODE', '151.61.172.169', 2147483647, 'user'),
(13, '2022-03-18T08:00:00.000Z', '2022-03-18T08:00:00.253Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(14, NULL, '2022-03-18T08:01:48.563Z', 1, 2, '10000000ce6b74fc', 'SET_MODE', '151.61.172.169', 2147483647, 'user'),
(15, '2022-03-18T09:00:00.000Z', '2022-03-18T09:00:00.188Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(16, '2022-03-18T10:00:00.000Z', '2022-03-18T10:00:00.136Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(17, '2022-03-18T11:00:00.000Z', '2022-03-18T11:00:00.126Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(18, '2022-03-18T12:00:00.000Z', '2022-03-18T12:00:00.201Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(19, '2022-03-18T13:00:00.000Z', '2022-03-18T13:00:00.040Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(20, '2022-03-18T14:00:00.000Z', '2022-03-18T14:00:00.121Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(21, '2022-03-18T15:00:00.000Z', '2022-03-18T15:00:00.040Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(22, '2022-03-18T16:00:00.000Z', '2022-03-18T16:00:00.166Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(23, '2022-03-18T17:00:00.000Z', '2022-03-18T17:00:00.039Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(24, '2022-03-18T18:00:00.000Z', '2022-03-18T18:00:00.111Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(25, '2022-03-18T19:00:00.000Z', '2022-03-18T19:00:00.036Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(26, '2022-03-18T20:00:00.000Z', '2022-03-18T20:00:00.114Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(27, '2022-03-18T21:00:00.000Z', '2022-03-18T21:00:00.037Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(28, '2022-03-18T22:00:00.000Z', '2022-03-18T22:00:00.136Z', 3, 2, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(29, NULL, '2022-03-18T22:36:39.379Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'start'),
(30, NULL, '2022-03-18T22:37:55.297Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'start'),
(31, NULL, '2022-03-18T22:38:17.200Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'start'),
(32, NULL, '2022-03-18T22:56:23.772Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'start'),
(33, NULL, '2022-03-18T22:57:19.476Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'start'),
(34, NULL, '2022-03-18T22:58:07.163Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'start'),
(35, '2022-03-18T23:00:00.000Z', '2022-03-18T23:00:00.268Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(36, NULL, '2022-03-18T23:02:20.225Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'start'),
(37, NULL, '2022-03-18T23:04:27.973Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'start'),
(38, NULL, '2022-03-18T23:05:31.192Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'start'),
(39, NULL, '2022-03-18T23:08:08.932Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'start'),
(40, NULL, '2022-03-18T23:09:09.917Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'start'),
(41, NULL, '2022-03-18T23:10:29.685Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'start'),
(42, NULL, '2022-03-18T23:11:41.276Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'start'),
(43, NULL, '2022-03-18T23:12:46.730Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'start'),
(44, NULL, '2022-03-18T23:14:26.833Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'start'),
(45, '2022-03-19T00:00:00.000Z', '2022-03-19T00:00:00.357Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(46, '2022-03-19T01:00:00.000Z', '2022-03-19T01:00:00.054Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(47, '2022-03-19T02:00:00.000Z', '2022-03-19T02:00:00.247Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(48, '2022-03-19T03:00:00.000Z', '2022-03-19T03:00:00.046Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(49, '2022-03-19T04:00:00.000Z', '2022-03-19T04:00:00.155Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(50, '2022-03-19T05:00:00.000Z', '2022-03-19T05:00:00.028Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(51, '2022-03-19T06:00:00.000Z', '2022-03-19T06:00:00.148Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(52, '2022-03-19T07:00:00.000Z', '2022-03-19T07:00:00.041Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(53, '2022-03-19T08:00:00.000Z', '2022-03-19T08:00:00.162Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(54, '2022-03-19T09:00:00.000Z', '2022-03-19T09:00:00.040Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(55, '2022-03-19T10:00:00.000Z', '2022-03-19T10:00:00.127Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(56, '2022-03-19T11:00:00.000Z', '2022-03-19T11:00:00.042Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(57, '2022-03-19T12:00:00.000Z', '2022-03-19T12:00:00.160Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(58, '2022-03-19T13:00:00.000Z', '2022-03-19T13:00:00.038Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(59, '2022-03-19T14:00:00.000Z', '2022-03-19T14:00:00.161Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(60, '2022-03-19T15:00:00.000Z', '2022-03-19T15:00:00.040Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(61, '2022-03-19T16:00:00.000Z', '2022-03-19T16:00:00.128Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(62, '2022-03-19T17:00:00.000Z', '2022-03-19T17:00:00.040Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(63, '2022-03-19T18:00:00.000Z', '2022-03-19T18:00:00.160Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(64, '2022-03-19T19:00:00.000Z', '2022-03-19T19:00:00.039Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(65, '2022-03-19T20:00:00.000Z', '2022-03-19T20:00:00.143Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(66, '2022-03-19T21:00:00.000Z', '2022-03-19T21:00:00.037Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(67, '2022-03-19T22:00:00.000Z', '2022-03-19T22:00:00.142Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(68, '2022-03-19T23:00:00.000Z', '2022-03-19T23:00:00.036Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(69, '2022-03-20T00:00:00.000Z', '2022-03-20T00:00:00.131Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(70, '2022-03-20T01:00:00.000Z', '2022-03-20T01:00:00.036Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(71, '2022-03-20T02:00:00.000Z', '2022-03-20T02:00:00.160Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(72, NULL, '2022-03-30T08:57:18.927Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'start'),
(73, NULL, '2022-03-30T08:57:43.576Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'start'),
(74, '2022-03-30T09:00:00.000Z', '2022-03-30T09:00:00.378Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(75, NULL, '2022-03-30T09:37:43.868Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'start'),
(76, '2022-03-30T10:00:00.000Z', '2022-03-30T10:00:00.403Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(77, '2022-03-30T11:00:00.000Z', '2022-03-30T11:00:00.049Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(78, '2022-03-30T12:00:00.000Z', '2022-03-30T12:00:00.160Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(79, '2022-03-30T13:00:00.000Z', '2022-03-30T13:00:00.042Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(80, '2022-03-30T14:00:00.000Z', '2022-03-30T14:00:00.136Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(81, '2022-03-30T15:00:00.000Z', '2022-03-30T15:00:00.040Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(82, '2022-03-30T16:00:00.000Z', '2022-03-30T16:00:00.148Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(83, '2022-03-30T17:00:00.000Z', '2022-03-30T17:00:00.041Z', 3, 1, '10000000ce6b74fc', 'SYS_LOG', '151.61.172.169', 2147483647, 'schedule'),
(84, NULL, '2024-07-22T21:16:18.553Z', 1, 1, '10000000ce6b74fc', 'SYS_LOG', '151.51.241.133', 2147483647, 'start');

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_system_schedule`
--

CREATE TABLE IF NOT EXISTS `grover_system_schedule` (
  `id` int(11) NOT NULL auto_increment,
  `enabled` tinyint(1) NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `lastUpdate` bigint(20) NOT NULL,
  `atMinute` varchar(11) DEFAULT NULL,
  `atHour` varchar(11) DEFAULT NULL,
  `atDay` varchar(11) DEFAULT NULL,
  `action` varchar(20) NOT NULL,
  `operatingMode` int(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_system_schedule`
--

INSERT INTO `grover_system_schedule` (`id`, `enabled`, `deleted`, `lastUpdate`, `atMinute`, `atHour`, `atDay`, `action`, `operatingMode`) VALUES
(1, 1, 0, 1, '0', '*', '*', 'SYS_LOG', 3);

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_workers_list`
--

CREATE TABLE IF NOT EXISTS `grover_workers_list` (
  `id` int(11) NOT NULL auto_increment,
  `locationId` int(11) NOT NULL,
  `workerType` int(11) NOT NULL,
  `enabled` tinyint(1) NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `lastUpdate` bigint(20) NOT NULL,
  `pin1` int(11) DEFAULT NULL,
  `pin2` int(11) DEFAULT NULL,
  `i2cAddress` text NOT NULL,
  `status` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3334 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_workers_list`
--

INSERT INTO `grover_workers_list` (`id`, `locationId`, `workerType`, `enabled`, `deleted`, `lastUpdate`, `pin1`, `pin2`, `i2cAddress`, `status`) VALUES
(5, 3, 2, 1, 0, 1, 0, 1, '0x23', 0),
(1, 1, 3, 1, 0, 1, 2, 3, '0x23', 0),
(4, 3, 1, 1, 0, 1, 0, NULL, '0x26', 0),
(6, 4, 1, 1, 0, 1, 1, NULL, '0x26', 0),
(8, 5, 1, 1, 0, 1, 2, NULL, '0x26', 0),
(10, 6, 1, 1, 0, 1, 3, NULL, '0x26', 0),
(2, 1, 9, 1, 0, 1, 4, NULL, '0x26', 0),
(3, 1, 10, 1, 0, 1, 5, NULL, '0x26', 0),
(7, 4, 2, 1, 0, 1, 0, 1, '0x23', 0),
(9, 5, 2, 1, 0, 1, 0, 1, '0x23', 0),
(11, 6, 2, 1, 0, 1, 0, 1, '0x23', 0);

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_workers_log`
--

CREATE TABLE IF NOT EXISTS `grover_workers_log` (
  `id` int(11) NOT NULL auto_increment,
  `idWorker` int(11) NOT NULL,
  `expectedTime` varchar(40) DEFAULT NULL,
  `executedTime` varchar(40) NOT NULL,
  `operatingMode` int(10) NOT NULL,
  `systemOperatingMode` int(11) NOT NULL,
  `serialNumber` varchar(40) NOT NULL,
  `action` varchar(40) NOT NULL,
  `ipAddress` varchar(40) NOT NULL,
  `parentId` int(11) NOT NULL,
  `parentName` varchar(40) NOT NULL,
  `lastUpdate` int(11) NOT NULL,
  `owner` varchar(40) NOT NULL,
  `type` int(11) NOT NULL,
  `duration` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=133 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_workers_log`
--

INSERT INTO `grover_workers_log` (`id`, `idWorker`, `expectedTime`, `executedTime`, `operatingMode`, `systemOperatingMode`, `serialNumber`, `action`, `ipAddress`, `parentId`, `parentName`, `lastUpdate`, `owner`, `type`, `duration`) VALUES
(1, 4, NULL, '2022-03-18T07:50:06.155Z', 1, 1, '10000000ce6b74fc', 'OFF', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, NULL),
(2, 4, NULL, '2022-03-18T07:50:09.520Z', 1, 1, '10000000ce6b74fc', 'OFF', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, NULL),
(3, 5, NULL, '2022-03-18T07:50:17.240Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Pot 1', 2147483647, 'start', 0, NULL),
(4, 11, NULL, '2022-03-18T07:50:17.279Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 4, 'Pot 4', 2147483647, 'start', 0, NULL),
(5, 6, NULL, '2022-03-18T07:50:17.270Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 2, 'Pot 2', 2147483647, 'start', 0, NULL),
(6, 9, NULL, '2022-03-18T07:50:17.293Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 3, 'Pot 3', 2147483647, 'start', 0, NULL),
(7, 2, NULL, '2022-03-18T07:50:17.186Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Bloom', 2147483647, 'start', 0, NULL),
(8, 4, NULL, '2022-03-18T07:50:17.250Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Pot 1', 2147483647, 'start', 0, NULL),
(9, 8, NULL, '2022-03-18T07:50:17.290Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 3, 'Pot 3', 2147483647, 'start', 0, NULL),
(10, 7, NULL, '2022-03-18T07:50:17.265Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 2, 'Pot 2', 2147483647, 'start', 0, NULL),
(11, 3, NULL, '2022-03-18T07:50:17.213Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Bloom', 2147483647, 'start', 0, NULL),
(12, 10, NULL, '2022-03-18T07:50:17.283Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 4, 'Pot 4', 2147483647, 'start', 0, NULL),
(13, 1, NULL, '2022-03-18T07:50:17.223Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Bloom', 2147483647, 'start', 0, NULL),
(14, 8, NULL, '2022-03-18T07:51:10.440Z', 0, 1, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 3, 'Pot 3', 2147483647, 'start', 0, NULL),
(15, 9, NULL, '2022-03-18T07:51:10.443Z', 0, 1, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 3, 'Pot 3', 2147483647, 'start', 0, NULL),
(16, 1, NULL, '2022-03-18T07:51:10.378Z', 0, 1, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Bloom', 2147483647, 'start', 0, NULL),
(17, 10, NULL, '2022-03-18T07:51:10.434Z', 0, 1, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 4, 'Pot 4', 2147483647, 'start', 0, NULL),
(18, 2, NULL, '2022-03-18T07:51:10.364Z', 0, 1, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Bloom', 2147483647, 'start', 0, NULL),
(19, 4, NULL, '2022-03-18T07:51:10.397Z', 0, 1, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Pot 1', 2147483647, 'start', 0, NULL),
(20, 3, NULL, '2022-03-18T07:51:10.371Z', 0, 1, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Bloom', 2147483647, 'start', 0, NULL),
(21, 6, NULL, '2022-03-18T07:51:10.421Z', 0, 1, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 2, 'Pot 2', 2147483647, 'start', 0, NULL),
(22, 5, NULL, '2022-03-18T07:51:10.390Z', 0, 1, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Pot 1', 2147483647, 'start', 0, NULL),
(23, 7, NULL, '2022-03-18T07:51:10.415Z', 0, 1, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 2, 'Pot 2', 2147483647, 'start', 0, NULL),
(24, 11, NULL, '2022-03-18T07:51:10.430Z', 0, 1, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 4, 'Pot 4', 2147483647, 'start', 0, NULL),
(25, 4, NULL, '2022-03-18T08:01:48.517Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Pot 1', 2147483647, 'start', 0, NULL),
(26, 5, NULL, '2022-03-18T08:01:48.511Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Pot 1', 2147483647, 'start', 0, NULL),
(27, 9, NULL, '2022-03-18T08:01:48.558Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 3, 'Pot 3', 2147483647, 'start', 0, NULL),
(28, 8, NULL, '2022-03-18T08:01:48.556Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 3, 'Pot 3', 2147483647, 'start', 0, NULL),
(29, 1, NULL, '2022-03-18T08:01:48.494Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Bloom', 2147483647, 'start', 0, NULL),
(30, 2, NULL, '2022-03-18T08:01:48.481Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Bloom', 2147483647, 'start', 0, NULL),
(31, 11, NULL, '2022-03-18T08:01:48.546Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 4, 'Pot 4', 2147483647, 'start', 0, NULL),
(32, 3, NULL, '2022-03-18T08:01:48.488Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 1, 'Bloom', 2147483647, 'start', 0, NULL),
(33, 7, NULL, '2022-03-18T08:01:48.530Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 2, 'Pot 2', 2147483647, 'start', 0, NULL),
(34, 6, NULL, '2022-03-18T08:01:48.537Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 2, 'Pot 2', 2147483647, 'start', 0, NULL),
(35, 10, NULL, '2022-03-18T08:01:48.550Z', 0, 2, '10000000ce6b74fc', 'SET_STATUS', '151.61.172.169', 4, 'Pot 4', 2147483647, 'start', 0, NULL),
(36, 4, NULL, '2022-03-18T09:25:12.757Z', 2, 2, '10000000ce6b74fc', 'OFF', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, NULL),
(37, 4, NULL, '2022-03-18T09:25:25.164Z', 2, 2, '10000000ce6b74fc', 'OFF', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, NULL),
(38, 2, NULL, '2022-03-18T09:25:45.536Z', 2, 2, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, NULL),
(39, 2, NULL, '2022-03-18T09:25:45.626Z', 2, 2, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, NULL),
(40, 3, NULL, '2022-03-18T09:25:50.838Z', 2, 2, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, NULL),
(41, 3, NULL, '2022-03-18T09:25:51.005Z', 2, 2, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, NULL),
(42, 4, NULL, '2022-03-18T09:25:58.436Z', 2, 2, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, NULL),
(43, 6, NULL, '2022-03-18T09:26:13.245Z', 2, 2, '10000000ce6b74fc', 'ON', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, NULL),
(44, 6, NULL, '2022-03-18T09:26:13.453Z', 2, 2, '10000000ce6b74fc', 'ON', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, NULL),
(45, 5, NULL, '2022-03-18T09:43:38.728Z', 2, 2, '10000000ce6b74fc', 'RUN_WATER', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, NULL),
(46, 4, NULL, '2022-03-18T09:50:36.454Z', 2, 2, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, NULL),
(47, 4, NULL, '2022-03-18T09:50:36.687Z', 2, 2, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, NULL),
(48, 6, NULL, '2022-03-18T09:50:42.790Z', 2, 2, '10000000ce6b74fc', 'ON', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, NULL),
(49, 8, NULL, '2022-03-18T09:51:03.003Z', 2, 2, '10000000ce6b74fc', 'ON', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, NULL),
(50, 8, NULL, '2022-03-18T09:52:02.795Z', 2, 2, '10000000ce6b74fc', 'ON', '151.61.172.169', 3, 'Pot 3', 2147483647, 'user', 0, NULL),
(51, 4, NULL, '2022-03-18T09:52:07.785Z', 2, 2, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, NULL),
(52, 4, NULL, '2022-03-18T09:52:08.026Z', 2, 2, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, NULL),
(53, 6, NULL, '2022-03-18T09:52:11.855Z', 2, 2, '10000000ce6b74fc', 'ON', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, NULL),
(54, 6, NULL, '2022-03-18T09:52:12.007Z', 2, 2, '10000000ce6b74fc', 'ON', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, NULL),
(55, 3, NULL, '2022-03-18T09:59:23.678Z', 2, 2, '10000000ce6b74fc', 'OFF', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, NULL),
(56, 2, NULL, '2022-03-18T10:02:05.069Z', 2, 2, '10000000ce6b74fc', 'OFF', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, NULL),
(57, 6, NULL, '2022-03-18T10:23:33.521Z', 2, 2, '10000000ce6b74fc', 'OFF', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, NULL),
(58, 6, NULL, '2022-03-18T10:23:35.623Z', 2, 2, '10000000ce6b74fc', 'OFF', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, NULL),
(59, 6, NULL, '2022-03-18T10:24:17.179Z', 2, 2, '10000000ce6b74fc', 'OFF', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, NULL),
(60, 6, NULL, '2022-03-18T10:24:18.959Z', 2, 2, '10000000ce6b74fc', 'OFF', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, NULL),
(61, 4, NULL, '2022-03-18T10:53:07.720Z', 2, 2, '10000000ce6b74fc', 'OFF', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, NULL),
(62, 4, NULL, '2022-03-18T10:53:09.800Z', 2, 2, '10000000ce6b74fc', 'OFF', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, NULL),
(63, 7, NULL, '2022-03-18T11:25:46.266Z', 2, 2, '10000000ce6b74fc', 'RUN_WATER', '151.61.172.169', 2, 'Pot 2', 2147483647, 'user', 0, NULL),
(64, 5, NULL, '2022-03-18T11:27:05.360Z', 2, 2, '10000000ce6b74fc', 'RUN_WATER', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, NULL),
(65, 5, NULL, '2022-03-18T11:27:33.370Z', 2, 2, '10000000ce6b74fc', 'RUN_WATER', '151.61.172.169', 1, 'Pot 1', 2147483647, 'user', 0, NULL),
(66, 6, 'Sat Mar 19 2022 11:00:00 GMT+0100 (Ora s', '2022-03-19T10:00:00.156Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 2, 'Pot 2', 2147483647, 'schedule', 0, NULL),
(67, 8, 'Sat Mar 19 2022 11:00:00 GMT+0100 (Ora s', '2022-03-19T10:00:00.142Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, NULL),
(68, 10, 'Sat Mar 19 2022 11:00:00 GMT+0100 (Ora s', '2022-03-19T10:00:00.169Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, NULL),
(69, 4, 'Sat Mar 19 2022 11:00:00 GMT+0100 (Ora s', '2022-03-19T10:00:00.184Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, NULL),
(70, 2, 'Sat Mar 19 2022 11:00:00 GMT+0100 (Ora s', '2022-03-19T10:00:00.214Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(71, 3, 'Sat Mar 19 2022 11:00:00 GMT+0100 (Ora s', '2022-03-19T10:00:00.198Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(72, 10, 'Sat Mar 19 2022 23:00:00 GMT+0100 (Ora s', '2022-03-19T22:00:00.183Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, NULL),
(73, 4, 'Sat Mar 19 2022 23:00:00 GMT+0100 (Ora s', '2022-03-19T22:00:00.173Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, NULL),
(74, 8, 'Sat Mar 19 2022 23:00:00 GMT+0100 (Ora s', '2022-03-19T22:00:00.205Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, NULL),
(75, 3, 'Sat Mar 19 2022 23:00:00 GMT+0100 (Ora s', '2022-03-19T22:00:00.162Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(76, 6, 'Sat Mar 19 2022 23:00:00 GMT+0100 (Ora s', '2022-03-19T22:00:00.194Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 2, 'Pot 2', 2147483647, 'schedule', 0, NULL),
(77, 2, 'Sat Mar 19 2022 23:00:00 GMT+0100 (Ora s', '2022-03-19T22:00:00.152Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(78, 2, NULL, '2022-03-20T02:06:08.024Z', 1, 1, '10000000ce6b74fc', 'OFF', '151.61.172.169', 1, 'Bloom', 2147483647, 'user', 0, NULL),
(79, 8, 'Wed Mar 30 2022 11:00:00 GMT+0200 (Ora l', '2022-03-30T09:00:00.104Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, NULL),
(80, 10, 'Wed Mar 30 2022 11:00:00 GMT+0200 (Ora l', '2022-03-30T09:00:00.180Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, NULL),
(81, 4, 'Wed Mar 30 2022 11:00:00 GMT+0200 (Ora l', '2022-03-30T09:00:00.205Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, NULL),
(82, 6, 'Wed Mar 30 2022 11:00:00 GMT+0200 (Ora l', '2022-03-30T09:00:00.229Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 5, 'Pot 5', 2147483647, 'schedule', 0, NULL),
(83, 3, 'Wed Mar 30 2022 11:00:00 GMT+0200 (Ora l', '2022-03-30T09:00:00.291Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(84, 2, 'Wed Mar 30 2022 11:00:00 GMT+0200 (Ora l', '2022-03-30T09:00:00.339Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(85, 4, 'Wed Mar 30 2022 12:00:00 GMT+0200 (Ora l', '2022-03-30T10:00:00.174Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, NULL),
(86, 6, 'Wed Mar 30 2022 12:00:00 GMT+0200 (Ora l', '2022-03-30T10:00:00.222Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 5, 'Pot 5', 2147483647, 'schedule', 0, NULL),
(87, 8, 'Wed Mar 30 2022 12:00:00 GMT+0200 (Ora l', '2022-03-30T10:00:00.249Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, NULL),
(88, 10, 'Wed Mar 30 2022 12:00:00 GMT+0200 (Ora l', '2022-03-30T10:00:00.270Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, NULL),
(89, 3, 'Wed Mar 30 2022 12:00:00 GMT+0200 (Ora l', '2022-03-30T10:00:00.364Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(90, 2, 'Wed Mar 30 2022 12:00:00 GMT+0200 (Ora l', '2022-03-30T10:00:00.332Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(91, 3, 'Wed Mar 30 2022 13:00:00 GMT+0200 (Ora l', '2022-03-30T11:00:00.108Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(92, 2, 'Wed Mar 30 2022 13:00:00 GMT+0200 (Ora l', '2022-03-30T11:00:00.136Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(93, 10, 'Wed Mar 30 2022 13:00:00 GMT+0200 (Ora l', '2022-03-30T11:00:00.158Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, NULL),
(94, 8, 'Wed Mar 30 2022 13:00:00 GMT+0200 (Ora l', '2022-03-30T11:00:00.173Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, NULL),
(95, 6, 'Wed Mar 30 2022 13:00:00 GMT+0200 (Ora l', '2022-03-30T11:00:00.195Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 5, 'Pot 5', 2147483647, 'schedule', 0, NULL),
(96, 4, 'Wed Mar 30 2022 13:00:00 GMT+0200 (Ora l', '2022-03-30T11:00:00.211Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, NULL),
(97, 2, 'Wed Mar 30 2022 14:00:00 GMT+0200 (Ora l', '2022-03-30T12:00:00.123Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(98, 10, 'Wed Mar 30 2022 14:00:00 GMT+0200 (Ora l', '2022-03-30T12:00:00.112Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, NULL),
(99, 8, 'Wed Mar 30 2022 14:00:00 GMT+0200 (Ora l', '2022-03-30T12:00:00.100Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, NULL),
(100, 3, 'Wed Mar 30 2022 14:00:00 GMT+0200 (Ora l', '2022-03-30T12:00:00.134Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(101, 6, 'Wed Mar 30 2022 14:00:00 GMT+0200 (Ora l', '2022-03-30T12:00:00.077Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 5, 'Pot 5', 2147483647, 'schedule', 0, NULL),
(102, 4, 'Wed Mar 30 2022 14:00:00 GMT+0200 (Ora l', '2022-03-30T12:00:00.047Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, NULL),
(103, 3, 'Wed Mar 30 2022 15:00:00 GMT+0200 (Ora l', '2022-03-30T13:00:00.093Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(104, 2, 'Wed Mar 30 2022 15:00:00 GMT+0200 (Ora l', '2022-03-30T13:00:00.120Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(105, 4, 'Wed Mar 30 2022 15:00:00 GMT+0200 (Ora l', '2022-03-30T13:00:00.221Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, NULL),
(106, 10, 'Wed Mar 30 2022 15:00:00 GMT+0200 (Ora l', '2022-03-30T13:00:00.167Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, NULL),
(107, 8, 'Wed Mar 30 2022 15:00:00 GMT+0200 (Ora l', '2022-03-30T13:00:00.188Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, NULL),
(108, 6, 'Wed Mar 30 2022 15:00:00 GMT+0200 (Ora l', '2022-03-30T13:00:00.201Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 5, 'Pot 5', 2147483647, 'schedule', 0, NULL),
(109, 10, 'Wed Mar 30 2022 16:00:00 GMT+0200 (Ora l', '2022-03-30T14:00:00.093Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, NULL),
(110, 6, 'Wed Mar 30 2022 16:00:00 GMT+0200 (Ora l', '2022-03-30T14:00:00.055Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 5, 'Pot 5', 2147483647, 'schedule', 0, NULL),
(111, 3, 'Wed Mar 30 2022 16:00:00 GMT+0200 (Ora l', '2022-03-30T14:00:00.115Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(112, 2, 'Wed Mar 30 2022 16:00:00 GMT+0200 (Ora l', '2022-03-30T14:00:00.105Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(113, 8, 'Wed Mar 30 2022 16:00:00 GMT+0200 (Ora l', '2022-03-30T14:00:00.081Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, NULL),
(114, 4, 'Wed Mar 30 2022 16:00:00 GMT+0200 (Ora l', '2022-03-30T14:00:00.031Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, NULL),
(115, 6, 'Wed Mar 30 2022 17:00:00 GMT+0200 (Ora l', '2022-03-30T15:00:00.158Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 5, 'Pot 5', 2147483647, 'schedule', 0, NULL),
(116, 8, 'Wed Mar 30 2022 17:00:00 GMT+0200 (Ora l', '2022-03-30T15:00:00.148Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, NULL),
(117, 10, 'Wed Mar 30 2022 17:00:00 GMT+0200 (Ora l', '2022-03-30T15:00:00.136Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, NULL),
(118, 2, 'Wed Mar 30 2022 17:00:00 GMT+0200 (Ora l', '2022-03-30T15:00:00.113Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(119, 4, 'Wed Mar 30 2022 17:00:00 GMT+0200 (Ora l', '2022-03-30T15:00:00.170Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, NULL),
(120, 3, 'Wed Mar 30 2022 17:00:00 GMT+0200 (Ora l', '2022-03-30T15:00:00.087Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(121, 8, 'Wed Mar 30 2022 18:00:00 GMT+0200 (Ora l', '2022-03-30T16:00:00.085Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, NULL),
(122, 10, 'Wed Mar 30 2022 18:00:00 GMT+0200 (Ora l', '2022-03-30T16:00:00.101Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, NULL),
(123, 4, 'Wed Mar 30 2022 18:00:00 GMT+0200 (Ora l', '2022-03-30T16:00:00.032Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, NULL),
(124, 6, 'Wed Mar 30 2022 18:00:00 GMT+0200 (Ora l', '2022-03-30T16:00:00.058Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 5, 'Pot 5', 2147483647, 'schedule', 0, NULL),
(125, 2, 'Wed Mar 30 2022 18:00:00 GMT+0200 (Ora l', '2022-03-30T16:00:00.112Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(126, 3, 'Wed Mar 30 2022 18:00:00 GMT+0200 (Ora l', '2022-03-30T16:00:00.123Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(127, 2, 'Wed Mar 30 2022 19:00:00 GMT+0200 (Ora l', '2022-03-30T17:00:00.109Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(128, 10, 'Wed Mar 30 2022 19:00:00 GMT+0200 (Ora l', '2022-03-30T17:00:00.121Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 4, 'Pot 4', 2147483647, 'schedule', 0, NULL),
(129, 6, 'Wed Mar 30 2022 19:00:00 GMT+0200 (Ora l', '2022-03-30T17:00:00.143Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 5, 'Pot 5', 2147483647, 'schedule', 0, NULL),
(130, 3, 'Wed Mar 30 2022 19:00:00 GMT+0200 (Ora l', '2022-03-30T17:00:00.087Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Bloom', 2147483647, 'schedule', 0, NULL),
(131, 8, 'Wed Mar 30 2022 19:00:00 GMT+0200 (Ora l', '2022-03-30T17:00:00.133Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 3, 'Pot 3', 2147483647, 'schedule', 0, NULL),
(132, 4, 'Wed Mar 30 2022 19:00:00 GMT+0200 (Ora l', '2022-03-30T17:00:00.155Z', 1, 1, '10000000ce6b74fc', 'ON', '151.61.172.169', 1, 'Pot 1', 2147483647, 'schedule', 0, NULL);

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_workers_schedule`
--

CREATE TABLE IF NOT EXISTS `grover_workers_schedule` (
  `id` int(11) NOT NULL auto_increment,
  `idWorker` int(11) NOT NULL,
  `enabled` tinyint(1) NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `lastUpdate` bigint(20) NOT NULL,
  `atMinute` varchar(11) DEFAULT NULL,
  `atHour` varchar(11) DEFAULT NULL,
  `atDay` varchar(11) DEFAULT NULL,
  `action` varchar(20) NOT NULL,
  `operatingMode` int(10) NOT NULL,
  `duration` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_workers_schedule`
--

INSERT INTO `grover_workers_schedule` (`id`, `idWorker`, `enabled`, `deleted`, `lastUpdate`, `atMinute`, `atHour`, `atDay`, `action`, `operatingMode`, `duration`) VALUES
(1, 2, 1, 0, 1, '0', '11-23', '1-5', 'ON', 1, NULL),
(2, 3, 1, 0, 1, '0', '11-23', '1-5', 'ON', 1, NULL),
(3, 4, 1, 0, 1, '0', '11-23', '1-5', 'ON', 1, NULL),
(4, 6, 1, 0, 1, '0', '11-23', '1-5', 'ON', 1, NULL),
(5, 8, 1, 0, 1, '0', '11-23', '1-5', 'ON', 1, NULL),
(6, 10, 1, 0, 1, '0', '11-23', '1-5', 'ON', 1, NULL),
(13, 2, 1, 0, 1, '0', '11-23', '6,0', 'ON', 1, NULL),
(14, 3, 1, 0, 1, '0', '11-23', '6,0', 'ON', 1, NULL),
(15, 4, 1, 0, 1, '0', '11-23', '6,0', 'ON', 1, NULL),
(16, 6, 1, 0, 1, '0', '11-23', '6,0', 'ON', 1, NULL),
(17, 8, 1, 0, 1, '0', '11-23', '6,0', 'ON', 1, NULL),
(18, 10, 1, 0, 1, '0', '11-23', '6,0', 'ON', 1, NULL);

-- --------------------------------------------------------

--
-- Struttura della tabella `grover_workers_type`
--

CREATE TABLE IF NOT EXISTS `grover_workers_type` (
  `id` int(11) NOT NULL auto_increment,
  `type` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `lastUpdate` bigint(20) NOT NULL,
  `color` text NOT NULL,
  `icon` varchar(20) NOT NULL,
  `title` varchar(40) NOT NULL,
  `defaultDuration` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=23 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `grover_workers_type`
--

INSERT INTO `grover_workers_type` (`id`, `type`, `enabled`, `deleted`, `lastUpdate`, `color`, `icon`, `title`, `defaultDuration`) VALUES
(1, 'Pot_Water_loop', 1, 0, 1562080566001, '3A65ED', 'arrows-rotate', 'H<sub>2</sub>O Loop', NULL),
(2, 'Pot_refill', 1, 0, 1562080566000, '3A65ED', 'whiskey-glass', 'Refill', 1000),
(20, 'Pot_Nutrient_refill', 1, 0, 1562080566000, '3A65ED', 'whiskey-glass', 'Pot Dose Refill', 1000),
(21, 'Pot_PHdown_refill', 1, 0, 1562080566000, '3A65ED', 'whiskey-glass', 'Pot pH &darr; Refill', 1000),
(3, 'Room_Water_refill', 1, 0, 1562080566000, '3A65ED', 'whiskey-glass', 'Room H<sub>2</sub>O Refill', 1000),
(22, 'Room_Nutrient_refill', 1, 0, 1562080566000, '3A65ED', 'whiskey-glass', 'Room Dose Refill', 1000),
(4, 'Room_PhDown_refill', 1, 0, 1562080566000, '3A65ED', 'whiskey-glass', 'Room pH &darr; Refill', 1000),
(5, 'Room_Gro_refill', 1, 0, 1562080566000, '3A65ED', 'whiskey-glass', 'Room Grow Refill', 1000),
(6, 'Room_Micro_refill', 1, 0, 1562080566000, '3A65ED', 'whiskey-glass', 'Room Micro Refill', 1000),
(7, 'Room_Bloom_refill', 1, 0, 1562080566000, 'FFD000', 'whiskey-glass', 'Room Bloom Refill', 1000),
(8, 'Room_Ripen_refill', 1, 0, 1562080566000, '3A65ED', 'whiskey-glass', 'Room Ripen Refill', 1000),
(9, 'Room_Fan', 1, 0, 1562080566001, '8FBC0F', 'fan', 'Fan', NULL),
(10, 'Room_Light', 1, 0, 1562080566000, 'FFD000', 'lightbulb', 'Light', NULL);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
