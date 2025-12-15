import React from "react";
import { NavLink } from "react-router-dom";
import { useUser } from '../context/UserContext';
import Sidebar from "./Sidebar";
import "../CSS/menu.css";

const PageHeader = ({ titulo, children }) => {
    const { usuario } = useUser();

    return (
        <div className="encabezado-fijo">
            <Sidebar />
            <div className="background-container-menu">
                <header className="header">
                    <div className="title-container">
                        <h2 className="title-menu">GIGAFLOP</h2>
                    </div>
                    <div className="container-icon">
                        <label htmlFor="btn-menu">
                            <i className="bi bi-person-circle custom-icon"></i>
                        </label>
                    </div>
                </header>

                <div className="option">
                    {/* Dashboard: admin y gerente */}
                    {(usuario?.rol === "administrador" || usuario?.rol === "gerente") && (
                        <NavLink
                            className={({ isActive }) => isActive ? "option-button2" : "option-button"}
                            to="/dashboard"
                        >
                            Dashboard
                        </NavLink>
                    )}

                    {/* Cotizaciones: todos */}
                    <NavLink
                        className={({ isActive }) => isActive ? "option-button2" : "option-button"}
                        to="/cotizaciones"
                    >
                        Cotizaciones
                    </NavLink>

                    {/* Clientes y Productos: solo vendedor y admin */}
                    {(usuario?.rol === "administrador" || usuario?.rol === "vendedor") && (
                        <>
                            <NavLink
                                className={({ isActive }) => isActive ? "option-button2" : "option-button"}
                                to="/clientes"
                            >
                                Clientes
                            </NavLink>
                            <NavLink
                                className={({ isActive }) => isActive ? "option-button2" : "option-button"}
                                to="/productos"
                            >
                                Productos
                            </NavLink>
                        </>
                    )}

                    {/* Configuración: solo admin */}
                    {usuario?.rol === "administrador" && (
                        <NavLink
                            className={({ isActive }) => isActive ? "option-button2" : "option-button"}
                            to="/configuracion"
                        >
                            Configuración
                        </NavLink>
                    )}
                </div>
            </div>

            {/* TOPBAR */}
            <section
                className="menu-superior"
            >
                <div className="cotizatitlecontainer">
                    <h1 className="cotizatitle">{titulo}</h1>
                </div>
                {children}
            </section>
        </div>
    );
};

export default PageHeader;
