# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, Float
from database import Base

class Company(Base):
    __tablename__ = "companies"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    industry = Column(String)
    location = Column(String)
    verificationStatus = Column(String)

class Resource(Base):
    __tablename__ = "resources"
    id = Column(String, primary_key=True, index=True)
    companyId = Column(String, index=True)
    name = Column(String)
    materialType = Column(String)
    quantity = Column(Float)
    unit = Column(String)
    quality = Column(String)
    location = Column(String)
    availability = Column(String)
    price = Column(Float)
    embedding = Column(String, nullable=True)

class Requirement(Base):
    __tablename__ = "requirements"
    id = Column(String, primary_key=True, index=True)
    companyId = Column(String, index=True)
    materialType = Column(String)
    quantity = Column(Float)
    unit = Column(String)
    quality = Column(String)
    requiredDate = Column(String)
    location = Column(String)
    embedding = Column(String, nullable=True)

class Match(Base):
    __tablename__ = "matches"
    id = Column(String, primary_key=True, index=True)
    resourceId = Column(String)
    requirementId = Column(String)
    matchScore = Column(Float)
    distanceKm = Column(Float)
    status = Column(String)
    negotiatedPrice = Column(Float, nullable=True)
    negotiatedQuantity = Column(Float, nullable=True)
    chatHistory = Column(String, nullable=True)

