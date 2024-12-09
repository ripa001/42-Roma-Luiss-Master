class ComputorException(Exception):
    """Base exception for the computor project"""
    pass

class DegreeError(ComputorException):
    """Exception raised when polynomial degree is too high"""
    pass

class ParseError(ComputorException):
    """Exception raised when parsing fails"""
    pass