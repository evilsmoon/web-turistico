/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     11/5/2021 19:42:35                           */
/*==============================================================*/


drop table if exists CATEGORIA;

drop table if exists DETALLE_VENTA;

drop table if exists DIRECCION;

drop table if exists INFORMACION;

drop table if exists MEDIDA;

drop table if exists NOTIFICACION;

drop table if exists OFERTA;

drop table if exists PERSONA;

drop table if exists PRESENTACION;

drop table if exists PRODUCTO;

drop table if exists ROL;

drop table if exists TIPO_PAGO;

drop table if exists VENTA;

/*==============================================================*/
/* Table: CATEGORIA                                             */
/*==============================================================*/
create table CATEGORIA
(
   CATEGORIA_ID         int not null AUTO_INCREMENT,
   CATEGORIA_NOMBRE     char(50) not null,
   CATEGORIA_DESCRIPCION text not null,
   CATEGORIA_ESTADO     char(30) not null,
   primary key (CATEGORIA_ID)
);

/*==============================================================*/
/* Table: DETALLE_VENTA                                         */
/*==============================================================*/
create table DETALLE_VENTA
(
   DETALLE_ID           int not null AUTO_INCREMENT,
   VENTA_ID             int,
   PRODUCTO_ID          int,
   DETALLE_OFERTA       text not null,
   DETALLE_CANTIDA      int not null,
   DETALLE_PRECIOUNITARIO decimal(5,2) not null,
   DETALLE_PRECIOTOTAL  decimal(5,2) not null,
   DETALLE_PRODUCTOR    int not null,
   VISIBLE_COMPRADOR    char(40),
   VISIBLE_VENDEDOR     char(40),
   primary key (DETALLE_ID)
);

/*==============================================================*/
/* Table: DIRECCION                                             */
/*==============================================================*/
create table DIRECCION
(
   DIRECCION_ID         int not null AUTO_INCREMENT,
   PROVINCIA            char(100) not null,
   CANTON               char(100) not null,
   PARROQUIA            char(100) not null,
   primary key (DIRECCION_ID)
);

/*==============================================================*/
/* Table: INFORMACION                                           */
/*==============================================================*/
create table INFORMACION
(
   INFORMACION_ID       int not null AUTO_INCREMENT,
   INFORMACION_DESCRIPCION text not null,
   INFORMACION_IMAGEN   char(60) not null,
   INFORMACION_URL      text not null,
   INFORMACION_ESTADO   char(30) not null,
   primary key (INFORMACION_ID)
);

/*==============================================================*/
/* Table: MEDIDA                                                */
/*==============================================================*/
create table MEDIDA
(
   MEDIDA_ID            int not null AUTO_INCREMENT,
   MEDIDA_NOMBRE        char(50) not null,
   MEDIDA_ESTADO        char(30) not null,
   primary key (MEDIDA_ID)
);

/*==============================================================*/
/* Table: NOTIFICACION                                          */
/*==============================================================*/
create table NOTIFICACION
(
   ID                   int not null AUTO_INCREMENT,
   PERSONA_ID           int,
   PRODUCTO_ID         int,
   FECHA                date not null,
   TIPO                 char(20) not null,
   MENSAJE              char(100) not null,
   primary key (ID)
);

/*==============================================================*/
/* Table: OFERTA                                                */
/*==============================================================*/
create table OFERTA
(
   OFERTA_ID            int not null AUTO_INCREMENT,
   PRODUCTO_ID          int,
   OFERTA_DESCRIPCION   text not null,
   primary key (OFERTA_ID)
);

/*==============================================================*/
/* Table: PERSONA                                               */
/*==============================================================*/
create table PERSONA
(
   PERSONA_ID           int not null AUTO_INCREMENT,
   DIRECCION_ID         int,
   ROL_ID               int,
   PERSONA_NOMBRE       char(100) not null,
   PERSONA_TELEFONO     char(15) not null,
   PERSONA_EMAIL        char(100) not null,
   PERSONA_CONTRASENA   char(60) not null,
   PERSONA_ESTADO       char(40) not null,
   PERSONA_LOGIN        timestamp not null,
   PERSONA_IMAGEN       longtext,
   PERSONA_URL          text,
   UNIQUE KEY users_email_unique (PERSONA_EMAIL),
   primary key (PERSONA_ID)
);

/*==============================================================*/
/* Table: PRESENTACION                                          */
/*==============================================================*/
create table PRESENTACION
(
   PRESENTACION_ID      int not null AUTO_INCREMENT,
   PRESENTACION_NOMBRE  char(50) not null,
   PRESENTACION_ESTADO  char(30) not null,
   primary key (PRESENTACION_ID)
);

/*==============================================================*/
/* Table: PRODUCTO                                              */
/*==============================================================*/
create table PRODUCTO
(
   PRODUCTO_ID          int not null AUTO_INCREMENT,
   PERSONA_ID           int,
   CATEGORIA_ID         int,
   PRESENTACION_ID      int,
   MEDIDA_ID            int,
   PRODUCTO_NOMBRE      char(60) not null,
   PRODUCTO_DESCRIPCION text not null,
   PRODUCTO_CANTIDAD    int not null,
   PRODUCTO_PRECIO      decimal(5,2) not null,
   PRODUCTO_MEDIDA      decimal(5,2),
   PRODUCTO_FECHAPUBLICACION timestamp not null,
   PRODUCTO_FECHALIMITE timestamp not null,
   PRODUCTO_FECHACOCECHA timestamp,
   PRODUCTO_ESTADO      char(30) not null,
   PRODUCTO_IMAGEN      longtext,
   PRODUCTO_URL         text,
   primary key (PRODUCTO_ID)
);

/*==============================================================*/
/* Table: ROL                                                   */
/*==============================================================*/
create table ROL
(
   ROL_ID               int not null AUTO_INCREMENT,
   ROL_NOMBRE           char(30) not null,
   primary key (ROL_ID)
);

/*==============================================================*/
/* Table: TIPO_PAGO                                             */
/*==============================================================*/
create table TIPO_PAGO
(
   PAGO_ID              int not null AUTO_INCREMENT,
   PAGO_NOMBRE          char(50) not null,
   primary key (PAGO_ID)
);

/*==============================================================*/
/* Table: VENTA                                                 */
/*==============================================================*/
create table VENTA
(
   VENTA_ID             int not null AUTO_INCREMENT,
   PERSONA_ID           int,
   PAGO_ID              int,
   VENTA_FECHA          char(50) not null,
   VENTA_TOTAL          decimal(5,2) not null,
   primary key (VENTA_ID)
);

alter table DETALLE_VENTA add constraint FK_RELATIONSHIP_15 foreign key (PRODUCTO_ID)
      references PRODUCTO (PRODUCTO_ID) on delete restrict on update restrict;

alter table DETALLE_VENTA add constraint FK_RELATIONSHIP_8 foreign key (VENTA_ID)
      references VENTA (VENTA_ID) on delete restrict on update restrict;

alter table NOTIFICACION add constraint FK_RELATIONSHIP_19 foreign key (PERSONA_ID)
      references PERSONA (PERSONA_ID) on delete restrict on update restrict;

alter table NOTIFICACION add constraint FK_RELATIONSHIP_20 foreign key (PRODUCTO_ID)
      references PRODUCTO (PRODUCTO_ID) on delete restrict on update restrict;

alter table OFERTA add constraint FK_RELATIONSHIP_13 foreign key (PRODUCTO_ID)
      references PRODUCTO (PRODUCTO_ID) on delete restrict on update restrict;

alter table PERSONA add constraint FK_RELATIONSHIP_11 foreign key (DIRECCION_ID)
      references DIRECCION (DIRECCION_ID) on delete restrict on update restrict;

alter table PERSONA add constraint FK_RELATIONSHIP_12 foreign key (ROL_ID)
      references ROL (ROL_ID) on delete restrict on update restrict;

alter table PRODUCTO add constraint FK_RELATIONSHIP_14 foreign key (CATEGORIA_ID)
      references CATEGORIA (CATEGORIA_ID) on delete restrict on update restrict;

alter table PRODUCTO add constraint FK_RELATIONSHIP_16 foreign key (PERSONA_ID)
      references PERSONA (PERSONA_ID) on delete restrict on update restrict;

alter table PRODUCTO add constraint FK_RELATIONSHIP_17 foreign key (PRESENTACION_ID)
      references PRESENTACION (PRESENTACION_ID) on delete restrict on update restrict;

alter table PRODUCTO add constraint FK_RELATIONSHIP_18 foreign key (MEDIDA_ID)
      references MEDIDA (MEDIDA_ID) on delete restrict on update restrict;

alter table VENTA add constraint FK_RELATIONSHIP_10 foreign key (PAGO_ID)
      references TIPO_PAGO (PAGO_ID) on delete restrict on update restrict;

alter table VENTA add constraint FK_RELATIONSHIP_9 foreign key (PERSONA_ID)
      references PERSONA (PERSONA_ID) on delete restrict on update restrict;

