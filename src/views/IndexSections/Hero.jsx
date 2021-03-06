
import React from "react";

// reactstrap components
import { Container, Row, Col } from "reactstrap";
import App from "../../App"


class Hero extends React.Component {
  render() {
    return (
      <>
        <div className="position-relative">
          {/* Hero for FREE version */}
          <section className="section section-lg section-hero section-shaped">
            {/* Background circles */}
            <div className="shape shape-style-1 shape-default">
              
              <span className="span-100" />
              <span className="span-100" />
              <span className="span-100" />
              <span className="span-100" />
              <span className="span-100" />
              <span className="span-100" />
              <span className="span-100" />

              <span className="span-75" />
              <span className="span-50" />
              <span className="span-100" />
              <span className="span-50" />
              <span className="span-100" />
            </div>
            <Container className="shape-container d-flex align-items-center ">
              <div className="col px-0">
                <Row className="align-items-center justify-content-center">
                  <Col className="text-center" lg="8">

                    <App />

                  </Col>
                </Row>
              </div>
            </Container>
          
          </section>
        </div>
      </>
    );
  }
}

export default Hero;
