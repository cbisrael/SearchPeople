CREATE TABLE [dbo].[Table]
(
	[iperson] INT NOT NULL PRIMARY KEY, 
    [first_name] NCHAR(80) NULL, 
    [last_name] NCHAR(80) NULL, 
    [address_line1] NCHAR(120) NULL, 
    [address_line2] NCHAR(120) NULL, 
    [city] NCHAR(55) NULL, 
    [zip] NCHAR(10) NULL, 
    [age] INT NULL, 
    [interests] TEXT NULL, 
    [picpath] NCHAR(10) NULL
)
