insert into club (slug, nombre, eyebrow, fecha_fundacion, hero_titulo_pre, hero_titulo_em, hero_titulo_post,
  hero_subtitulo, hero_cifras, fundacion_relato, fundacion_foto_caption,
  kits_intro, camadas_intro, mistica_intro, hermandad_texto,
  actualidad_intro, actualidad_de_donde, actualidad_hacia_donde,
  memoria_intro, memoria_nota, galeria_intro, cta_titulo, cta_texto)
values (
  'sportboys',
  'Sport Boys San Gregorio',
  'Club Deportivo · San Gregorio',
  '1990-09-05',
  'Sport Boys,', 'una historia', 'vestida de rosa',
  'Desde una noche de setiembre de 1990 hasta cada domingo de hoy: la historia de un grupo de muchachos que se cansó de mirar desde la banca y decidió fundar su propio club.',
  '[{"numero":"1990","label":"Fundación"},{"numero":"4","label":"Camadas"},{"numero":"3×","label":"Campeón Feria 12 Oct."},{"numero":"36","label":"Años de historia"}]'::jsonb,
  E'La historia del Sport Boys de San Gregorio comenzó un 5 de setiembre de 1990, a las 7:00 p.m., en la casa de Don Segundo Ricardo Gonzales Serrano.\n\nEn aquel entonces, los muchachos jugaban en el club Unión, pero la chispa de la división surgió tras ganar un título cuyo premio fue un toro en la tradición festiva de la verbena. Al ver que solo unos pocos dirigentes antiguos disfrutaron solos del trofeo ganado con el sudor de la cancha, la juventud decidió emprender su propio camino y fundar un club independiente.\n\nAquella noche, reunidos para marcar un nuevo rumbo, trece nombres quedaron escritos para siempre en la historia del pueblo.',
  'La primera camada, en las calles de San Gregorio. Los que empezaron todo.',
  'Las primeras indumentarias del Boys cuentan la historia de la solidaridad de su gente: cada camiseta fue, primero, un favor.',
  'Cuatro generaciones de jugadores, cada una con su apodo, su estilo y su lugar en la memoria del club.',
  'El Sport Boys nunca fue solo un equipo de fútbol. Fue —y es— la excusa perfecta para que San Gregorio entero se junte.',
  'Si a un jugador le tocaba desgranar o juntar su alverja los domingos, el equipo entero acudía en la mañana a apoyarlo en el campo para que pudiera estar libre y jugar por la tarde. Comer entre dos o tres personas de un solo plato era común: más que un club, eran una familia.',
  'A pesar de ser uno de los equipos más representativos y respetados de la zona, el Sport Boys todavía no tiene una sede social propia.',
  'Históricamente, las reuniones se realizaban en las gradas de la iglesia o en la calle donde los encontrara la noche. Hubo intentos de gestión con autoridades locales —como la donación no concretada del espacio detrás de la posta— pero al ser compromisos verbales, quedaron en el olvido.',
  'Hoy, tras periodos de reorganización, la directiva y los muchachos han reanudado actividades con un objetivo claro: adquirir un lote propio y construir el local institucional que la historia de este club merece.',
  'El club rinde homenaje permanente a los fundadores y jugadores que defendieron la camiseta rosada y que hoy ya no están.',
  'Su legado vive en cada partido del Sport Boys de San Gregorio.',
  'Fragmentos del archivo del club. Cada foto, un domingo distinto.',
  'La historia sigue abierta',
  'Esta cápsula de memoria crece con cada generación. Si tienes una foto, una fecha o una anécdota del Sport Boys de San Gregorio, es parte de esta historia — y todavía puede sumarse.'
)
on conflict (slug) do nothing;

insert into founders (club_slug, nombre, apodo, es_presidente, orden) values
('sportboys','Don Segundo Ricardo Gonzales Serrano', null, true, 0),
('sportboys','Marco Alvitres Vásquez','Repo', false, 1),
('sportboys','Richard Gonzales Bazán','Kily', false, 2),
('sportboys','Lalo Vásquez','Garay', false, 3),
('sportboys','Gomer Llique Alvarado','Bajazo', false, 4),
('sportboys','Luis Becerra Cabanillas','Oso', false, 5),
('sportboys','Jorge Bazán Chavarry', null, false, 6),
('sportboys','Porfirio Bazán Martínez','Zambo', false, 7),
('sportboys','Iván Castañeda Gonzales', null, false, 8),
('sportboys','Ronald Castañeda Gonzales', null, false, 9),
('sportboys','Dulman Salazar Espinoza', null, false, 10),
('sportboys','Fernando Salazar Espinoza', null, false, 11),
('sportboys','Paco Bazán Bazán', null, false, 12);

insert into kits (club_slug, anio, nombre, descripcion, color_hex, orden) values
('sportboys','1990','Verdes de emergencia','Las primeras camisetas fueron prestadas por el Colegio San Gregorio, gracias a la gestión del director Don Grimaldo Alvitres.','#4E7F4A',0),
('sportboys','Años 90','Negros con verde','Confeccionados con esfuerzo propio. Duraron poco, pero marcaron una época del club.','#232323',1),
('sportboys','Años 90–2000','Las azules (Lomas)','Donadas por Don Horacio Suárez, hermano de "Chayo". El club vistió de azul durante años de consolidación.','#2255A4',2),
('sportboys','Hasta hoy','La rosa emblemática','Fieles al nombre inspirado en el clásico "Boys", el club vistió finalmente de rosado — el color que es identidad hasta el día de hoy.','#E23F8E',3);

with c1 as (
  insert into camadas (club_slug, nombre, emoji, descripcion, orden)
  values ('sportboys','Primera camada — Los Fundadores','🥇','Los que se plantaron aquella noche de 1990 y salieron a la cancha con camisetas prestadas. Yamer Huatay, hincha incondicional, completa esta primera lista como uno más del plantel.',0)
  returning id
)
insert into camada_jugadores (camada_id, nombre, rol_destacado, orden)
select id, v.nombre, v.rol, v.orden from c1, (values
  ('Marco Alvitres Vásquez "Repo"','Capitán',0),
  ('Ricardo Gonzales Bazán "Kily"','Arquero',1),
  ('Lalo Vásquez "Garay"', null, 2),
  ('Gomer Llique Alvarado "Bajazo"', null, 3),
  ('Luis Becerra Cabanillas "Oso"', null, 4),
  ('Jorge Bazán Chavarry', null, 5),
  ('Porfirio Bazán Martínez "Zambo"','Defensa',6),
  ('Iván Castañeda Gonzales', null, 7),
  ('Ronald Castañeda Gonzales', null, 8),
  ('Dulman Salazar Espinoza', null, 9),
  ('Fernando Salazar Espinoza', null, 10),
  ('Paco Bazán Bazán', null, 11),
  ('Yamer Huatay — hincha incondicional', null, 12)
) as v(nombre, rol, orden);

with c2 as (
  insert into camadas (club_slug, nombre, emoji, descripcion, orden)
  values ('sportboys','Segunda camada — Consolidación','🥈','Con el club ya andando, esta generación sostuvo la estructura y afianzó al Sport Boys como una fuerza local respetada.',1)
  returning id
)
insert into camada_jugadores (camada_id, nombre, rol_destacado, orden)
select id, v.nombre, null, v.orden from c2, (values
  ('Pablo Gonzales Bazán',0),('Hugo Bazán Bazán',1),('Telmo Gonzales Vásquez "Liquio"',2),
  ('Segundo Bazán Chavarry',3),('Percy Cabanillas "Zozani"',4),('Euler Díaz Ramírez',5)
) as v(nombre, orden);

with c3 as (
  insert into camadas (club_slug, nombre, emoji, descripcion, orden)
  values ('sportboys','Tercera camada — La Época Grande','🥉','La generación de los grandes apodos y los títulos en la Feria del 12 de Octubre. La que más se recuerda en las conversaciones del pueblo.',2)
  returning id
)
insert into camada_jugadores (camada_id, nombre, rol_destacado, orden)
select id, v.nombre, null, v.orden from c3, (values
  ('Clever Martínez Huatay "Guava"',0),('Wilson Becerra Cavanillas "Coya"',1),('Elven Espinoza Medina "Chavo"',2),
  ('Manuel Gonzales Vásquez "Kanko"',3),('Jamer Juanito Martínez Huatay "Pipas"',4),('Wilson Malca Castro "Chino Coreano"',5),
  ('Gey Alexander Bazán Bazán "Burra"',6),('Rigoberto Sánchez Alvites "Rigo"',7),('Edgar Alvitres Vásquez "Chocho"',8),
  ('Óscar Cáceda Bazán "Oca"',9),('Henrry Hernández Quiróz',10)
) as v(nombre, orden);

with c4 as (
  insert into camadas (club_slug, nombre, emoji, descripcion, orden)
  values ('sportboys','Cuarta camada — Semillero y Presente','🏅','Los que hoy siguen llevando la rosa a la cancha, y los que ya empiezan a escribir la próxima página del club.',3)
  returning id
)
insert into camada_jugadores (camada_id, nombre, rol_destacado, orden)
select id, v.nombre, null, v.orden from c4, (values
  ('José Julca Coscol "Topo"',0),('Elvis Julca Coscol "Chanchito"',1),('Bryan Bazán Chavarry "Loco"',2),
  ('César Suárez Cáceda "Kim"',3),('Alexis Suárez Cáceda "Lu"',4),('Freddy Hernández Quiróz "Payoma"',5),
  ('Cristian Bazán Castañeda "Chimbumba"',6),('Cristian Linares Chuquilín "Manguito"',7),('Luis Romero Llique "Churguita"',8),
  ('Yeremi Medina "Yerbas"',9),('Paolo Quiróz Gonzales',10),('Dennis Gonzales Vásquez',11)
) as v(nombre, orden);

insert into anecdotas (club_slug, tag, titulo, texto, cita, orden) values
('sportboys','Tradición','A punta de borregos','Antes, la competencia local se jugaba disputando borregos. Ganar un partido significaba realizar una comida comunitaria para todo el pueblo: el vecindario entero aportaba, casa por casa —una cebolla, un tomate, arroz, papas, gaseosas— y todos comían juntos, en una verdadera fiesta popular sin distinciones.', null, 0),
('sportboys','Anécdota','Una raya más al tigre','Dulman era el alma y la chispa del grupo. Improvisó un acta en una hoja sacada de una acequia para comprometer al equipo a jugar la Feria de la Pajilla: "Ustedes firmen no más, mañana lo paso a limpio". Al día siguiente, tras caer en semifinales, una hebra de alambre de púa lo alcanzó en el vientre bajando el cerco al anochecer.', '¡No se preocupen, es una raya más al tigre!', 1);

insert into rivales (club_slug, label, nombres, orden) values
('sportboys','Clásicos de la parte baja','Sauce · Cristal Miradorcito', 0),
('sportboys','El clásico del pueblo','Defensor Lives · Los Chavales Lives', 1),
('sportboys','Torneo mayor','Feria del 12 de Octubre', 2);

insert into stats_hitos (club_slug, numero, etiqueta, orden) values
('sportboys','3×','campeón de la Feria del 12 de Octubre, con un equipo formado casi en su totalidad por gente de San Gregorio — máximo 2 refuerzos externos por edición.', 0);

insert into memoria (club_slug, nombre, orden) values
('sportboys','Don Segundo Ricardo Gonzales Serrano', 0),
('sportboys','Sergio Castañeda', 1),
('sportboys','Percy Cabanillas "Zozani"', 2),
('sportboys','Óscar Cáceda Bazán "Oca"', 3),
('sportboys','Ronald Castañeda Gonzales', 4);
