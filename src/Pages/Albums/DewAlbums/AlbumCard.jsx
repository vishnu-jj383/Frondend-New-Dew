import { Button, Card, Col } from "antd";
import { useNavigate } from "react-router-dom";

const { Meta } = Card;

const AlbumCard = () => {
    const navigate = useNavigate();
    const id = 17;
  return (
    <Col xs={24} sm={12} md={8} lg={6} xl={8} className="card_body" onClick={() => navigate(`/dewAlbum/${id}`)}>
    <Card
      hoverable
      style={{ width: "100%", }}
      cover={
        <img
          alt="example"
          src={"https://i.pinimg.com/736x/fe/94/ba/fe94babd8483716a84e2ead8f0e4e1f1.jpg"}
          width={100}
          height={250}
        />
      }
    >
      <Meta title="Concept: C-112" description="Date: 12 Feb 2025" />
    </Card>
  </Col>
  )
}

export default AlbumCard